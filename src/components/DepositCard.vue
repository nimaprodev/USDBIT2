<template>
    <div class="bg-gray-100 p-6 rounded-md w-full ">

        <div class="flex justify-between gap-2 ">
            <div class="flex-1 bg-gray-50 p-4 rounded-md flex flex-col ">
                <p class="text-primary text-sm">Total Deposit</p>
                <p class="text-white text-xl font-bold mt-1">{{ total_deposit }} USDT</p>
            </div>

            <div class="flex-1 bg-gray-50 p-4 rounded-md flex flex-col ">
                <p class="text-primary text-sm">Total Withdraw</p>
                <p class="text-white text-xl font-bold mt-1">{{ total_withdraw }} USDT</p>
            </div>
        </div>

        <div class="flex flex-col mt-2">
            <div class="flex flex-col mt-2">
                <label class="text-gray-300 text-sm mb-2" for="amount">Amount</label>

                <div class="relative">
                    <input id="amount" type="number" v-model="amount" placeholder="Enter amount" class="w-full p-3 pr-16 rounded-lg bg-gray-700 text-white
             focus:outline-none focus:ring-2 focus:ring-primary" />

                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm font-semibold select-none">
                        USDT
                    </span>
                </div>
            </div>

            <div class="flex items-center gap-2 mt-3">
                <div v-for="item in quickValues" :key="item" @click="selectValue(item)" :class="[
                    'px-2.5 py-1 rounded-md  text-xs font-medium cursor-pointer border transition whitespace-nowrap',
                    selected === item
                        ? 'bg-gray-600 text-white border-primary'
                        : 'text-gray-500 border-gray-500 hover:border-primary'
                ]">
                    {{ item }}
                </div>
            </div>
        </div>
        <div class="flex items-center justify-end mt-5 mb-2">
            <img :src="trendUp" alt="trendUp Image" class="object-contain" />
            <p class="text-xs text-gray-400">Your Balance {{ balance }} USDT</p>
        </div>
        <button class="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
            v-loading="isLoading"
            @click="doDeposit">
            Deposit Now
        </button>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from '@wagmi/vue';
import { formatEther, parseEther, maxUint256 } from 'viem';
import { useToast } from 'vue-toast-notification';
import { usdbitContractAddress, usdtTokenAddress } from '../contracts/usdbit.js';
import trendUp from '../assets/images/trend-up.svg'
import loadingDirective from '../directives/loading.js';
import {erc20_abi, usdbitABI} from "../contracts/abi.js";

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
const quickValues = ["10%", "25%", "50%", "75%", "MAX"]

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
        total_deposit.value = parseFloat(formatEther(newVal.total_deposit));
        total_withdraw.value = parseFloat(formatEther(newVal.total_withdraw));
    } else {
        total_deposit.value = '0.00';
        total_withdraw.value = '0.00';
    }
});

watch(balanceData, (newVal) => {
    if (newVal) {
        balance.value = parseFloat(formatEther(newVal));
    } else {
        balance.value = '0.00';
    }
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
        const depositAmount = parseEther(amount.value.toString());

        // 1. Check allowance and approve if necessary
        await refetchAllowance();
        if (allowance.value < depositAmount) {
            $toast.info("Waiting for approval...");
            const approveHash = await approveAsync({
                abi: erc20_abi,
                address: usdtTokenAddress,
                functionName: 'approve',
                args: [usdbitContractAddress, maxUint256] // Approve max for simplicity
            });
            // You can optionally wait for the transaction to be mined
            // const { status } = await waitForTransactionReceipt({ hash: approveHash });
            // if (status !== 'success') throw new Error("Approval failed");
        }

        // 2. Call deposit function
        $toast.info("Processing deposit...");
        const depositHash = await depositAsync({
            abi: usdbitABI,
            address: usdbitContractAddress,
            functionName: 'deposit',
            args: [depositAmount]
        });

        // Optionally wait for deposit confirmation
        // await waitForTransactionReceipt({ hash: depositHash });

        $toast.success("Deposit successful!");
        // Refresh data after deposit
        refetchUserInfo();
        refetchBalance();
        amount.value = '';
        selected.value = null;

    } catch (error) {
        console.error("Deposit failed:", error);
        $toast.error(error.shortMessage || "Deposit failed. Please try again.");
    } finally {
        isLoading.value = false;
    }
};
</script>