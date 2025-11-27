import {defineConfig} from 'vite'
import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [
        vue(),
        obfuscatorPlugin({
            debugProtection: true,
            debugProtectionInterval: 4000,
            disableConsoleOutput: true,
            deadCodeInjection: true,

            include: ["src/*.js", "src/**/*.js", "src/**/*.ts"],
            exclude: [/node_modules/],
            apply: "build",
            debugger: true,
            options: {
                debugProtection: true,
                debugProtectionInterval: 4000,
                disableConsoleOutput: true,
                deadCodeInjection: true,
            },

        }),
    ],
});
