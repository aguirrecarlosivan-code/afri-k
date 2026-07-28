/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        radar: {
          dark: '#0B0F17',
          card: '#151C2C',
          border: '#232D42',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
          accent: '#6366F1',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
