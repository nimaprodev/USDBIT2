<template>
    <div class="bg-gray-100 p-6 rounded-md w-full ">

        <div class="flex justify-between gap-2 ">
            <div class="flex-1 bg-gray-50 p-4 rounded-md flex flex-col ">
                <p class="text-primary text-sm">Total Deposit</p>
                <p class="text-white text-xl font-bold mt-1">{{ formatDisplayNumber(total_deposit) }} USDT</p>
            </div>

            <div class="flex-1 bg-gray-50 p-4 rounded-md flex flex-col ">
                <p class="text-primary text-sm">Total Withdraw</p>
                <p class="text-white text-xl font-bold mt-1">{{ formatDisplayNumber(total_withdraw) }} USDT</p>
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
            <p class="text-xs text-gray-400">Your Balance {{ formatDisplayNumber(balance) }} USDT</p>
        </div>
        <button class="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
            v-loading="isLoading"
            @click="doDeposit">
            Deposit Now
        </button>
    </div>
</template>

<script setup>
import { useDepositCard } from '../composables/useDepositCard.js';
import trendUp from '../assets/images/trend-up.svg';

const {
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
} = useDepositCard();
</script>
