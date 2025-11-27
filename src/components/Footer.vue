<template>
    <div class="relative text-center overflow-hidden">
        <img :src="footer" alt="footer" class="object-cover w-full h-auto" />

        <div class="absolute inset-0 flex flex-col  items-center text-center px-4 pb-6 mt-10">
            <img :src="footerLogo" alt="footer logo" />
            <p class="text-justify mt-5 text-base text-gray-500">
                Lorem Ipsum is a standard placeholder text used in the graphic, print, and publishing industries for
                previewing layouts and visual mockups. </p>
            <button class="text-gray-200 px-4 py-2 rounded-lg border border-grey-300 mt-6 flex items-center gap-2">
                <img :src="telegram" alt="telegram" />
                Telegram Channel
            </button>
        </div>
    </div>
</template>

<script setup>
import footer from '../assets/images/footer.png'
import footerLogo from '../assets/images/footer-logo.svg'
import telegram from '../assets/images/telegram.svg'

</script>

