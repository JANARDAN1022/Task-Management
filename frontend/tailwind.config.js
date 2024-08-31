/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        primary: '#262627',
        secondary: '#323238',
        background: '#1B1B1E',
        ticketBtns: '#DCDCDE',
        secondaryBackground:'#2E2E2F',
      }
    },
  },
  plugins: [],
}