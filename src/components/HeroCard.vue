<template>
    <div class="relative bg-bgCard shadow-custom-glow p-6  text-center overflow-hidden">
      
      <header class="absolute top-0 left-0 w-full flex items-center justify-between px-5 py-4">
        <img :src="logo" alt="Hero Image" class="object-cover " />

        <button class="bg-primary text-white px-4 py-2 rounded-md">
          Connect Wallet
        </button>
      </header>
  
      <div class="mt-16">
        <img :src="heroImg" alt="Hero Image" class="object-cover mx-auto mb-4" />
  
        <p class="text-2xl text-white font-bold w-3/4 mx-auto">
          Grow your future
        </p>
        <p class="text-2xl text-white font-bold w-11/12 mx-auto mt-1">
          with USDBIT and enjoy
        </p>
        <p class="text-2xl text-white font-bold w-full mx-auto mt-1">
          bonuses every single day
        </p>
  
        <p class="mt-3 text-xs text-white mx-auto w-full">
          1% daily bonus (0.5% withdrawal + 0.5% auto compound)
        </p>
        <div class="mt-5">
          <button class="bg-primary text-white px-6 py-2 rounded-md font-semibold">
            Lets Go!
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import heroImg from '../assets/images/hero.png'
  import logo from '../assets/images/logo.svg'

  </script>
  