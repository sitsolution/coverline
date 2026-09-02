/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F2D4A',
          light: '#1A3F66',
        },
        accent: '#2D7DD2',
      },
    },
  },
  plugins: [],
};
