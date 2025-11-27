<template>
    <div class="w-full text-center">
        <div class="relative w-full pb-20">
            <img :src="totalCommissionImg" alt="Total Commissions" class="object-cover w-full h-auto" />
            <div class="absolute inset-x-0 bottom-0 px-4 ">
                <div class="bg-gray-100 p-6 rounded-md w-full  mx-auto ">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 rounded-md bg-primary flex items-center justify-center">
                            <img :src="group" alt="Group Icon" class="object-contain" />
                        </div>
                        <div class="flex flex-col text-left flex-1">
                            <p class="text-primary font-semibold text-sm">Total Commissions</p>
                            <span class="text-xl font-semibold text-white mt-2 leading-none">123.45 USDT</span>
                            <a href="#" class="text-white text-xs mt-2 inline-flex items-center">
                                Withdraw Now
                                <img :src="arrowRight" alt="Arrow Right" class="ml-2 align-middle" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-col gap-2 w-full max-w-md mx-auto mt-4 px-4">
            <div v-for="level in levels" :key="level.name"
                class="bg-gray-800 p-4 rounded-md w-full flex items-center gap-4">
                <div class="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
                    <img :src="level.icon" alt="Level Icon" class="w-6 h-6 object-contain" />
                </div>
                <div class="flex flex-col text-left">
                    <p class="text-primary font-bold text-sm">{{ level.name }}</p>
                    <span class="text-xl font-semibold text-white ">{{ level.percent }}%</span>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import totalCommissionImg from '../assets/images/total_commissions.png'
import arrowRight from '../assets/images/arrow-right.svg'
import group from '../assets/images/group.svg'
import bitcoinConvert from '../assets/images/bitcoin-convert.svg'

const levels = [
    { name: 'Level 1', percent: '5', icon: bitcoinConvert },
    { name: 'Level 2', percent: '5', icon: bitcoinConvert },
    { name: 'Level 3', percent: '5', icon: bitcoinConvert },
    { name: 'Level 4', percent: '5', icon: bitcoinConvert },
]

</script>

