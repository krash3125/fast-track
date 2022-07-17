/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ft-grey': '#F1F3F5',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
