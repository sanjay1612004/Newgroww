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
          green: '#00d09c',
          'green-dark': '#00b386',
          'green-light': '#e8faf6',
          dark: '#000000',
          card: '#1e1e1e',
          'card-hover': '#2a2a2a',
          border: '#333333',
          text: '#f5f5f5',
          muted: '#9e9e9e',
          red: '#eb5757',
          'red-light': '#fef0f0',
          yellow: '#f5a623',
          bg: '#121212',
          surface: '#181818',
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
