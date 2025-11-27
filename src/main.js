import {VueQueryPlugin, QueryClient} from '@tanstack/vue-query'
import {WagmiPlugin} from '@wagmi/vue'
// import {Buffer} from 'buffer'
import {createApp} from 'vue'
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-default.css';

// `@coinbase-wallet/sdk` uses `Buffer`
// globalThis.Buffer = Buffer

import App from './App.vue'
import './style.css'
import {config} from './wagmi'

const app = createApp(App)
const queryClient = new QueryClient()


app
    .use(WagmiPlugin, {config})
    .use(ToastPlugin)

    .use(VueQueryPlugin, { queryClient })
    .mount('#app')
