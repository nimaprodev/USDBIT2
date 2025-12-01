// wagmi.js
import {createConfig, createStorage, http, useSwitchChain} from '@wagmi/vue'
import { bsc } from '@wagmi/vue/chains'
import { injected } from '@wagmi/vue/connectors'

// const WC_PROJECT_ID = "839da402a52855c58cb99552e5c84ee1"


export const config = createConfig({
  chains: [bsc],

  connectors: [
    injected(),
  ],

  storage: createStorage({
    storage: localStorage,
    key: 'vite-vue',
  }),

  transports: {
    [bsc.id]: http(),
  },
})
