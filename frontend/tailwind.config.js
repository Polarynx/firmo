/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 8px 2px rgba(99,102,241,0.15)' },
          '50%':       { boxShadow: '0 0 18px 4px rgba(99,102,241,0.35)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.4s ease both',
        shimmer:  'shimmer 1.4s infinite linear',
        glow:     'glow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
