/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        groww: {
          green: 'var(--color-green)',
          'green-dark': 'var(--color-green-dark)',
          'green-light': 'var(--color-green-light)',
          dark: 'var(--color-dark)',
          card: 'var(--color-card)',
          'card-hover': 'var(--color-card-hover)',
          border: 'var(--color-border)',
          text: 'var(--color-text)',
          muted: 'var(--color-muted)',
          red: 'var(--color-red)',
          'red-light': 'var(--color-red-light)',
          yellow: 'var(--color-yellow)',
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-green': 'pulseGreen 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 208, 156, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(0, 208, 156, 0)' },
        },
      },
    },
  },
  plugins: [],
}
