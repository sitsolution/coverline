/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:     '#14202E',
        navy:    '#0F3D5C',
        'navy-2':'#175E86',
        'navy-3':'#0B2D45',
        'navy-4':'#071E2E',
        sky:     '#EAF2F8',
        'sky-2': '#D8E9F3',
        'sky-3': '#5FB4E0',
        slate:   '#5C6B7A',
        'slate-2':'#8697A6',
        line:    '#DCE4EA',
        paper:   '#F5F8FA',
        success: '#1F8A5F',
        'success-bg': '#E3F5EC',
        urgent:  '#C0392B',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
