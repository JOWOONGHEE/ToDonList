
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-green': '#4FD4D6',
        'custom-green-light': '#D1EFEF'
      },
      fontFamily:{
        'kakao':['kakao_regula']
      },
      fontWeight: {
        'medi_semibold': 550
      }
    },
  },
  plugins: [],
}

