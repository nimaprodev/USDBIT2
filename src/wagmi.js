import { createConfig, createStorage, http } from '@wagmi/vue'
import { bsc } from '@wagmi/vue/chains'

export const config = createConfig({
  chains: [bsc],
  storage: createStorage({ storage: localStorage, key: 'vite-vue' }),
  transports: {
    [bsc.id]: http(),
  },
})
