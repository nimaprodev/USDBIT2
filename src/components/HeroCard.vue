<template>
    <div class="relative bg-bgCard shadow-custom-glow  text-center overflow-hidden">

        <header class="absolute top-0 left-0 w-full flex items-center justify-between px-5 py-4 z-10">
            <img :src="logo" alt="Hero Image" class="object-cover " />
            <div v-if="isConnected" class="flex items-center space-x-2">
                <span class="text-black text-sm  bg-yellow-500  px-3 py-1 rounded-md">{{ shortAddress }}</span>
<!--                <button @click="() => disconnect()">-->
<!--                    Disconnect-->
<!--                </button>-->
            </div>
            <button v-else @click="() => connect({ connector: connectors[0] })" class="bg-primary text-white px-4 py-2 rounded-md">
                Connect Wallet
            </button>
        </header>
        <div class="mt-16">
            <img :src="heroImg" alt="Hero Image" class="object-cover w-full h-auto" />
            <div class="absolute inset-0 flex flex-col justify-end items-center text-center px-4 pb-6">
                <p class="text-2xl text-white font-bold w-3/4">
                    Grow your future
                </p>
                <p class="text-2xl text-white font-bold w-11/12 mt-1">
                    with USDBIT and enjoy
                </p>
                <p class="text-2xl text-white font-bold w-full mt-1">
                    bonuses every single day
                </p>

                <p class="mt-3 text-xs text-white w-full">
                    1% daily bonus (0.5% withdrawal + 0.5% auto compound)
                </p>

                <div class="mt-5">
                    <button class="bg-primary text-white px-6 py-2 rounded-md font-semibold">
                        Lets Go!
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
  import heroImg from '../assets/images/hero.png'
  import logo from '../assets/images/logo.svg'
  import { useAccount, useConnect, useDisconnect, useConnectors } from '@wagmi/vue'
  import { computed } from 'vue'

  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  // const { disconnect } = useDisconnect()
  const connectors = useConnectors()

  const shortAddress = computed(() => {
    if (address.value) {
      return `${address.value.substring(0, 4)}...${address.value.substring(address.value.length - 6)}`
    }
    return ''
  })
</script>