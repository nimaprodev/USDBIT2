// wagmi.js
import { createConfig, createStorage, http } from '@wagmi/vue'
import { bsc } from '@wagmi/vue/chains'
import { walletConnect, injected } from '@wagmi/vue/connectors'

const WC_PROJECT_ID = "839da402a52855c58cb99552e5c84ee1"

export const config = createConfig({
  chains: [bsc],

  connectors: [
    // اول injected برای مرورگرها (MetaMask, etc.)
    injected(),

    // بعد WalletConnect برای موبایل / QR
    walletConnect({
      projectId: WC_PROJECT_ID,
      chains: [bsc], // خیلی مهم: بفرستش داخل connector
      metadata: {
        name: 'usdbit',
        description: 'usdbit',
        url: 'https://usdbit.net',
        icons: ['https://usdbit.net/logo.png'],
      },
    }),
  ],

  storage: createStorage({
    storage: localStorage,
    key: 'vite-vue',
  }),

  transports: {
    [bsc.id]: http(),
  },
})
