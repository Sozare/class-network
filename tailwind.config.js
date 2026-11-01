/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        telegram: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          brand: '#24A1DE',
          dark: '#1c87bc',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 12px 24px -6px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'float': '0 20px 30px -10px rgba(14, 165, 233, 0.15)',
      },
    },
  },
  plugins: [],
}