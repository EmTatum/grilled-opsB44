/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Cormorant Garamond', 'serif'],
        body: ['Raleway', 'sans-serif'],
      },
      colors: {
        gold: '#C9A84C',
        'gold-light': '#E8D08A',
        rose: '#C2185B',
        cream: '#F5F0E8',
        bg: '#0a0a0a',
        surface: '#111111',
        card: '#1a1a1a',
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '2px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        '2xl': '2px',
        full: '9999px',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};