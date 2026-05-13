/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255,255,255,0.72)',
          dark: 'rgba(30,30,30,0.72)',
        },
      },backdropBlur: {
        glass: '20px',
      },
      animation: {
        'slide-up': 'slideUp 0.35s cubic-bezier(0.32,0.72,0,1)','slide-down': 'slideDown 0.35s cubic-bezier(0.32,0.72,0,1)',
        'fade-in': 'fadeIn 0.2s ease-out',
        'typing-dot': 'typingDot 1.4s infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        typingDot: {
          '0%, 60%, 100%': { opacity: '0.2' },
          '30%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
