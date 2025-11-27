<template>
    <div class="bg-gray-100 p-6 rounded-md max-w-[380px] mx-auto  shadow-lg">

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
                    <input id="amount" type="number" placeholder="Enter amount" class="w-full p-3 pr-16 rounded-lg bg-gray-700 text-white 
             focus:outline-none focus:ring-2 focus:ring-primary" />

                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm font-semibold">
                        USDT
                    </span>
                </div>
            </div>

            <div class="flex items-center gap-2 mt-3">
                <div v-for="item in quickValues" :key="item" @click="selectValue(item)" :class="[
                    'px-2.5 py-1 rounded-md  text-xs font-medium cursor-pointer border transition whitespace-nowrap',
                    selected === item
                        ? 'bg-gray-200 text-white border-primary'
                        : 'text-gray-300 border-gray-200 hover:border-primary'
                ]">
                    {{ item }}
                </div>
            </div>
        </div>
        <div class="flex items-center justify-end  mt-5 mb-2">
            <img :src="trendUp" alt="trendUp Image" class="object-contain" />
            <p class="text-xs text-gray-400">Your Balance {{ balance }} USDT</p>
        </div>
        <button class="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition">
            Deposit Now
        </button>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAccount, useReadContract } from '@wagmi/vue';
import { formatEther } from 'viem';
import { usdbitContractAddress, usdbitABI, usdtTokenAddress, usdtTokenABI } from '../contracts/usdbit.js';
import trendUp from '../assets/images/trend-up.svg'

const { address, isConnected } = useAccount();

const total_deposit = ref('0.00');
const total_withdraw = ref('0.00');
const balance = ref('0.00');
const quickValues = ["10%", "25%", "50%", "75%", "MAX"]

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
    abi: usdtTokenABI,
    address: usdtTokenAddress,
    functionName: 'balanceOf',
    args: [address],
    query: {
        enabled: computed(() => isConnected.value && !!address.value),
    }
});

watch(userInfoData, (newVal) => {
    if (newVal) {
        total_deposit.value = parseFloat(formatEther(newVal.total_deposit)).toFixed(2);
        total_withdraw.value = parseFloat(formatEther(newVal.total_withdraw)).toFixed(2);
    } else {
        total_deposit.value = '0.00';
        total_withdraw.value = '0.00';
    }
});

watch(balanceData, (newVal) => {
    if (newVal) {
        balance.value = parseFloat(formatEther(newVal)).toFixed(2);
    } else {
        balance.value = '0.00';
    }
});

watch(isConnected, (connected) => {
    if (connected) {
        refetchUserInfo();
        refetchBalance();
    } else {
        total_deposit.value = '0.00';
        total_withdraw.value = '0.00';
        balance.value = '0.00';
    }
});
</script>