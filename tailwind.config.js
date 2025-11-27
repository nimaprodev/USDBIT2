/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
      extend: {
        colors: {
          primary: '#02B075',
          secondary: '#1FC7D4',
          bgCard: '#090C11',   
          gray: {
            light: '#EDEDED',   // برای بک‌گراند روشن
            50:'#1A212F',
            100: '#121720', 
          },
        },
        boxShadow: {
          'custom-glow': '0 -3px 97px -51px #BDFFDE', 
        },
        fontFamily: {
          body: ["Inter", "Helvetica", "Arial", "sans-serif"],
          sans: ["Inter", "Helvetica", "Arial", "sans-serif"],
          mono: ["Inter", "Helvetica", "Arial", "sans-serif"],
        },
        screens: {
          sx: '390px',
        },
      },
    },
    plugins: [],
  };
  