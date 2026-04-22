/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        start: '#F4845F',
        goal: '#E87070',
        traced: '#4CAF7D',
        cell: '#F5F5F5',
        border: '#E0E0E0',
      },
    },
  },
  plugins: [],
}
