import { ref, computed, watch } from 'vue';
import { useAccount, useReadContract, useWriteContract } from '@wagmi/vue';
import { formatEther, parseEther, maxUint256 } from 'viem';
import { useToast } from 'vue-toast-notification';
import { usdbitContractAddress, usdtTokenAddress } from '../contracts/usdbit.js';
import { erc20_abi, usdbitABI } from "../contracts/abi.js";
import loadingDirective from '../directives/loading.js';

export function useDepositCard() {
    const $toast = useToast({
        position: 'top-right',
        duration: 4000,
    });
    const vLoading = loadingDirective;
    const { address, isConnected } = useAccount();
    const total_deposit = ref('0.00');
    const total_withdraw = ref('0.00');
    const balance = ref('0.00');
    const isLoading = ref(false);
    const amount = ref('');
    const selected = ref(null);
    const quickValues = ["10%", "25%", "50%", "75%", "MAX"];

    const formatDisplayNumber = (value) => {
        if (typeof value === 'undefined' || value === null) return '0.00';
        const number = parseFloat(value);
        if (isNaN(number)) return '0.00';
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 3,
        }).format(number);
    };

    const formatAndSetBigIntValue = (bigIntValue) => {
        if (bigIntValue) {
            return formatEther(bigIntValue);
        }
        return '0.00';
    };

    // --- Hooks for contract interaction ---
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        abi: erc20_abi,
        address: usdtTokenAddress,
        functionName: 'allowance',
        args: computed(() => [address.value, usdbitContractAddress]),
        query: {
            enabled: computed(() => isConnected.value && !!address.value),
        }
    });

    const { writeContractAsync: approveAsync } = useWriteContract();
    const { writeContractAsync: depositAsync } = useWriteContract();

    const { data: userInfoData, refetch: refetchUserInfo } = useReadContract({
        abi: usdbitABI,
        address: usdbitContractAddress,
        functionName: 'userInfo',
        args: [address],
        query: {
            enabled: computed(() => isConnected.value && !!address.value),
        }
    });

    const { data: balanceData, refetch: refetchBalance } = useReadContract({
        abi: erc20_abi,
        address: usdtTokenAddress,
        functionName: 'balanceOf',
        args: [address],
        query: {
            enabled: computed(() => isConnected.value && !!address.value),
        }
    });

    watch(userInfoData, (newVal) => {
        if (newVal) {
            total_deposit.value = formatAndSetBigIntValue(newVal.total_deposit);
            total_withdraw.value = formatAndSetBigIntValue(newVal.total_withdraw);
        } else {
            total_deposit.value = '0.00';
            total_withdraw.value = '0.00';
        }
    });

    watch(balanceData, (newVal) => {
        balance.value = formatAndSetBigIntValue(newVal);
    });

    watch(isConnected, (connected) => {
        if (connected) {
            refetchUserInfo();
            refetchBalance();
            refetchAllowance();
        } else {
            total_deposit.value = '0.00';
            total_withdraw.value = '0.00';
            balance.value = '0.00';
        }
    });

    const selectValue = (value) => {
        selected.value = value;
        if (value === "MAX") {
            amount.value = balance.value;
        } else if (value.endsWith("%")) {
            const percentage = parseInt(value);
            const calculatedAmount = (parseFloat(balance.value) * percentage / 100);
            amount.value = calculatedAmount;
        }
    };

    const doDeposit = async () => {
        if (!amount.value || parseFloat(amount.value) <= 0) {
            $toast.error("Please enter a valid amount.");
            return;
        }

        isLoading.value = true;
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const refCode = urlParams.get('ref') || '0';

            const depositAmount = parseEther(amount.value.toString());

            await refetchAllowance();
            if (allowance.value < depositAmount) {
                $toast.info("Waiting for approval...");
                await approveAsync({
                    abi: erc20_abi,
                    address: usdtTokenAddress,
                    functionName: 'approve',
                    args: [usdbitContractAddress, maxUint256]
                });
            }

            $toast.info("Processing deposit...");
            await depositAsync({
                abi: usdbitABI,
                address: usdbitContractAddress,
                functionName: 'deposit',
                args: [depositAmount, refCode]
            });

            $toast.success("Deposit successful!");
            refetchUserInfo();
            refetchBalance();
            amount.value = '';
            selected.value = null;

        } catch (error) {
            console.error("Deposit failed:", error);
            $toast.error(error.shortMessage || "Deposit failed. Please try again.");
            isLoading.value = false;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        total_deposit,
        total_withdraw,
        balance,
        isLoading,
        amount,
        selected,
        quickValues,
        vLoading,
        formatDisplayNumber,
        selectValue,
        doDeposit,
    };
}