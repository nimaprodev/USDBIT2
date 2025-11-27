
/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
        fontFamily: {
            body: ["Kanit", "Helvetica", "Arial", "sans-serif"],
        },
        extend: {
            colors: {
                primary: '#A881FC',
                secondary: '#1FC7D4',
            }
  },
        screens: {
            'sx': '390px',
        },
    },
    // Plugin
  plugins: [],
};