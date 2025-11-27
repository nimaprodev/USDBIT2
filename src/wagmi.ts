import { createConfig, createStorage, http } from '@wagmi/vue'
import { bsc, bscTestnet } from '@wagmi/vue/chains'

export const config = createConfig({
  // chains: [bsc, bscTestnet],
  chains: [bscTestnet],
  storage: createStorage({ storage: localStorage, key: 'vite-vue' }),
  transports: {
    // [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
})

declare module '@wagmi/vue' {
  interface Register {
    config: typeof config
  }
}
