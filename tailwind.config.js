/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dde6ff',
          200: '#c0d0ff',
          300: '#94b0ff',
          400: '#6285ff',
          500: '#3d5eff',
          600: '#2b3ef5',
          700: '#2130e0',
          800: '#1e28b5',
          900: '#1d278f',
          950: '#111557',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
