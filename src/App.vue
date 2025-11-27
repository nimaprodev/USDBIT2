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
      <ReferralCard />
      <TotalCommissionCard />
      <div class="text-white p-6 my-6">
        <p class="text-base font-semibold">Level System</p>
        <div class="flex gap-2">
          <p class="text-2xl font-extrabold">
            Progress
          </p>
          <p class="text-2xl font-extrabold text-primary">
            with Purpose
          </p>
        </div>
        <p class="text-justify mt-4 text-base leading-loose text-gray-400">
          USDBIT’s 3-level structure is designed to reward your activity and consistency. Start at Level 1, unlock
          greater benefits at Level 2, and reach Level 3 for maximum bonuses and exclusive opportunities. The more you
          participate, the more you earn—simple, transparent, motivating.
        </p>
      </div>
      <Footer/>
    </div>
  </div>
</template>

<script setup lang="ts">
import HeroCard from './components/HeroCard.vue'
import DepositCard from './components/DepositCard.vue'
import RewardCard from './components/RewardCard.vue'
import ReferralCard from './components/ReferralCard.vue'
import TotalCommissionCard from './components/TotalCommissionCard.vue'
import Footer from './components/Footer.vue'

</script>
