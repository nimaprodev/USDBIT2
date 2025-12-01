import {ref, computed, watch} from 'vue';
import {erc20_abi, usdbitABI} from "../contracts/abi.js";
import {useAccount, useReadContract, useWriteContract} from '@wagmi/vue';
import loadingDirective from '../directives/loading.js';
import {usdbitContractAddress, usdtTokenAddress} from '../contracts/usdbit.js';
import {useToast} from 'vue-toast-notification';
import {parseEther, maxUint256} from 'viem';
import {useUser} from "./useUser.js";
import { formatDisplayNumber } from '../utils/format.js';

export function useDepositCard() {
    const $toast = useToast({
        position: 'top-right',
        duration: 4000,
    });
    const vLoading = loadingDirective;
    const {address, isConnected} = useAccount();
    const { total_deposit, total_withdraw, refetchUserInfo } = useUser();
    const balance = ref('0.00');
    const isLoading = ref(false);
    const amount = ref('20');
    const selected = ref(null);
    const quickValues = ["10%", "25%", "50%", "75%", "MAX"];


    // --- Hooks for contract interaction ---
    const {data: allowance, refetch: refetchAllowance} = useReadContract({
        abi: erc20_abi,
        address: usdtTokenAddress,
        functionName: 'allowance',
        args: computed(() => [address.value, usdbitContractAddress]),
        query: {
            enabled: computed(() => isConnected.value && !!address.value),
        }
    });

    const {writeContractAsync: approveAsync} = useWriteContract();
    const {writeContractAsync: depositAsync} = useWriteContract();

    const {data: balanceData, refetch: refetchBalance} = useReadContract({
        abi: erc20_abi,
        address: usdtTokenAddress,
        functionName: 'balanceOf',
        args: [address],
        query: {
            enabled: computed(() => isConnected.value && !!address.value),
            refetchInterval: 5000,
        }
    });

    watch(balanceData, (newVal) => {
        balance.value = (newVal);
    });

    watch(isConnected, (connected) => {
        if (connected) {
            refetchBalance();
            refetchAllowance();
        } else {
            balance.value = '0.00';
        }
    });

    const selectValue = (value) => {
        selected.value = value;
        if (value === "MAX") {
            amount.value = parseFloat(balance.value)  / 10**18;
        } else if (value.endsWith("%")) {
            const percentage = parseInt(value);
            const calculatedAmount = (parseFloat(balance.value) * percentage / 100) / 10**18;
            amount.value = calculatedAmount;
        }
    };

    const doDeposit = async () => {
        if (!amount.value || parseFloat(amount.value) <= 0) {
            $toast.error("Please enter a valid amount.");
            return;
        }

        if (parseFloat(amount.value) < 20) {
            $toast.error("Minimum deposit is 20 USDT.");
            return;
        }


        if (parseFloat(amount.value) > parseFloat(balance.value)) {
            $toast.error("Insufficient balance.");
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
        $toast,
        quickValues,
        vLoading,
        formatDisplayNumber,
        selectValue,
        doDeposit,
    };
}