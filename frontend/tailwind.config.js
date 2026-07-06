/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'navy': '#0F172A',
        'navy-light': '#1E293B',
        'deep-dark': '#0B1120',
        'pcmc-blue': '#1D4ED8',
        'pcmc-blue-light': '#3B82F6',
        'status-green': '#16A34A',
        'status-amber': '#D97706',
        'status-red': '#DC2626',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        'lg': '16px',
      },
    },
  },
  plugins: [],
}
