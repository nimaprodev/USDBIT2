<template>
    <div class="relative text-center overflow-hidden">
        <img :src="footer" alt="footer" class="object-cover w-full h-auto" />

        <div class="absolute inset-0 flex flex-col  items-center text-center px-4 pb-6 mt-10">
            <img :src="footerLogo" alt="footer logo" />
            <p class="text-justify mt-5 text-base text-gray-500">
                USDBIT runs on a transparent USDT smart contract that rewards you with fixed daily profits for 120 days.<br />
Your capital stays securely locked while earnings are paid automatically.<br />
Our 4-level referral system delivers instant USDT bonuses.<br />
USDBIT — smart, stable, and blockchain-driven income.<br />



 </p>
            <a href="t.me/usdbit_team" class="text-gray-200 px-4 py-2 rounded-lg border border-grey-300 mt-6 flex items-center gap-2">
                <img :src="telegram" alt="telegram" />
                Telegram Channel
            </a>
        </div>
    </div>
</template>

<script setup>
import footer from '../assets/images/footer.png'
import footerLogo from '../assets/images/footer-logo.svg'
import telegram from '../assets/images/telegram.svg'

</script>

