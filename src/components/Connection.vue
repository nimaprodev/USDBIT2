<script setup lang="ts">
import { useConnection, useDisconnect, usePublicClient } from '@wagmi/vue'
import {config} from "../wagmi.ts";
import {getBalance} from "viem/actions";
import {ref, watch} from "vue";


const { address, chainId, status } = useConnection()
const publicClient = usePublicClient({ config })
const { disconnect } = useDisconnect()
const balance = ref()

watch(address, async (newAddress) => {
  if (newAddress && publicClient.value) {
    balance.value = await getBalance(publicClient.value, {
      address: newAddress,
    })
  } else {
    balance.value = undefined
  }
}, { immediate: true })

</script>

<template>
  <h2>Connection</h2>

  <div>
    address: {{ address }}
    <br />
    chainId: {{ chainId }}
    <br />
    status: {{ status }}
        <br />

    balance: {{ balance?.formatted }}
  </div>

  <button v-if="status !== 'disconnected'" type="button" @click="disconnect()">
    Disconnect
  </button>
</template>