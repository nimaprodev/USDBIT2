<template>
    <div class="bg-gray-100 p-6 w-full">
        <img :src="referralImg" alt="referral Image" class="object-cover mb-4" />

        <div class="flex items-center text-2xl font-extrabold gap-2 mb-4">
            <span class="text-white">Your</span>
            <span class="text-primary">referral link</span>
        </div>

        <p class="text-justify text-base leading-loose text-gray-400 mb-6">
            Share your unique link and earn rewards every time someone joins through you. Invite friends, build your
            network,
            and grow together—success is better when shared.
        </p>

        <div class="relative w-full mb-10">
            <input readonly value="0x1234...abcd"
                class="w-full pl-4 py-3 rounded-xl bg-gray-50 text-white focus:outline-none focus:ring-2 focus:ring-primary" />
            <button
                class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary flex items-center justify-center"
                @click="copyToClipboard">
                <img :src="clipboard" alt="clipboard" class="w-5 h-5" />
            </button>
        </div>
    </div>
</template>
  
<script setup>
import referralImg from '../assets/images/referral.png'
import clipboard from '../assets/images/clipboard.svg'

const copyToClipboard = () => {
    navigator.clipboard.writeText("0x1234...abcd")
    alert("Copied!")
}
</script>
  