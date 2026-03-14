/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f8fbf2',
          100: '#edf6de',
          400: '#8fbf45',
          500: '#709f2f',
          700: '#3f6212',
        },
      },
    },
  },
  plugins: [],
};
