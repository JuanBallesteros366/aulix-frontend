/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        13: '3.25rem',
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          600: '#3730a3',
          700: '#312e81',
          800: '#1e1b4b',
          900: '#0f172a',
        },
        slate: {
          950: '#f5f8ff',
          900: '#eef3ff',
          800: '#e3ebfc',
          700: '#cdd9f3',
          600: '#a9b9dc',
          500: '#4f5f84',
          400: '#3d4e75',
          300: '#2b3c62',
          200: '#1a2b4f',
          100: '#0b1b3a',
        },
        indigo: {
          50: '#e6edff',
          300: '#172554',
          400: '#1e3a8a',
          500: '#1e40af',
          950: '#0b1b3a',
        },
        violet: {
          500: '#3b6fe0',
          600: '#2563eb',
        },
        cyan: {
          500: '#9ddce0',
        },
        blue: {
          500: '#adcaf5',
        },
        emerald: {
          300: '#207657',
          500: '#91d7b2',
        },
        teal: {
          500: '#a6ded4',
        },
      },
      fontFamily: {
        sans: [
          '"DM Sans"',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

