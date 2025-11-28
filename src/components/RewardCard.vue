<template>
    <div class="relative text-center overflow-hidden">
        <img :src="rewardImg" alt="Reward Image" class="object-cover w-full h-auto" />

        <div class="absolute inset-0 flex flex-col justify-end items-center text-center px-4 pb-6">

            <div class="bg-gray-100 p-6 rounded-md w-full">

                <div class="flex items-start gap-4 p-2 rounded-md">

                    <div class="w-14 h-14 rounded-md bg-primary flex items-center justify-center  mt-1">
                        <img :src="walletMoney" alt="walletMoney" class="object-contain" />
                    </div>

                    <div class="flex flex-col text-left">
                        <p class="text-primary font-semibold text-sm">Your Reward</p>

                        <span class="text-xl font-semibold text-white leading-none mt-3">
                            {{formatDisplayNumber(your_reward)}} USDT
                        </span>
                        <button  class="text-white text-sm mt-5 inline-flex items-center bg-secondary p-2 rounded">
                            Withdraw Now
                            <img :src="arrowRight" alt="arrow right" class="ml-2 align-middle" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import rewardImg from '../assets/images/reward.png'
import walletMoney from '../assets/images/wallet-money.svg'
import arrowRight from '../assets/images/arrow-right.svg'
import { useUser } from '../composables/useUser.js';

const { your_reward,   formatDisplayNumber} = useUser();
</script>