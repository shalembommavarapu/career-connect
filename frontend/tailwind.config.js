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
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Electric indigo
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          accent: '#8b5cf6', // Electric purple
          cyan: '#06b6d4',
          emerald: '#10b981'
        },
        dark: {
          bg: '#090d16',
          card: '#0f172a',
          surface: '#172033',
          border: '#1e293b',
          muted: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(99, 102, 241, 0.25)',
        'glow-accent': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
      }
    },
  },
  plugins: [],
};
