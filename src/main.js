import {createApp} from 'vue'
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-default.css';
import VueClipboard from "vue-clipboard2";


import App from './App.vue'
import './style.css'

const app = createApp(App)


app
    .use(ToastPlugin)
    .use(VueClipboard)
    .mount('#app')
