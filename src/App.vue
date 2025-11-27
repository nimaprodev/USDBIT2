<template>
  <div class="w-full min-h-screen flex justify-center items-start">
    <div class="w-[380px] min-h-[700px] overflow-hidden">
      <HeroCard />
      <DepositCard />
      <RewardCard />
      <div class="text-white p-6 my-6">
        <p class="text-base font-semibold">Welcome to USDBIT</p>
        <p class="text-2xl font-extrabold">
          Your Smart Financial
        </p>
        <p class="text-2xl font-extrabold text-primary">
          Experience
        </p>
        <p class="text-justify mt-4 text-base leading-loose text-gray-400">
          Welcome to usdbit – your ultimate gateway to powerful Polygon-based investments! At PolyCash, we offer a
          high-yield opportunity with 3.5% daily ROI for 100 days — starting with just 10 POL. Our smart system ensures
          maximum growth through transparent, reliable, and automated returns. Plus, with our 4-level referral program,
          you
          earn even more by inviting others: 5% - 3% - 2% - 1% — directly to your wallet. Join PolyCash today and
          experience
          next-level staking — where smart investing meets real rewards.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import HeroCard from './components/HeroCard.vue'
import DepositCard from './components/DepositCard.vue'
import RewardCard from './components/RewardCard.vue'

</script>
