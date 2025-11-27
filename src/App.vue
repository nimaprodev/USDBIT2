<template>
  <div class="w-full min-h-screen flex justify-center items-start">
    <div class="w-[380px] min-h-[700px] overflow-hidden">
      <HeroCard />
      <DepositCard />
    </div>
  </div>
</template>

<script setup lang="ts">
import HeroCard from './components/HeroCard.vue'
import DepositCard from './components/DepositCard.vue'

</script>
