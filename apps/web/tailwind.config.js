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
        sky:     '#EAF2F8',
        'sky-2': '#D8E9F3',
        slate:   '#5C6B7A',
        'slate-2':'#8697A6',
        line:    '#DCE4EA',
        paper:   '#F5F8FA',
        success: '#1F8A5F',
        'success-bg':'#E3F5EC',
        warning: '#C97A2B',
        'warning-bg':'#FBECDC',
        urgent:  '#C0392B',
        'urgent-bg':'#FBE7E4',
        gold:    '#B8862E',
        'gold-bg':'#F6EEDC',
        info:    '#2E6DA4',
        'info-bg':'#E4EEF7',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
        sm:      '8px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,61,92,.06), 0 8px 24px rgba(15,61,92,.08)',
      },
    },
  },
  plugins: [],
};
