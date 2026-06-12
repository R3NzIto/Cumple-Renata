/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        invitation: {
          cream: '#FAF8F5',       // Warm textured paper cream
          paper: '#FFFDFB',       // Pure white paper card
          blue: '#A1C6EA',        // Soft baby/metallic blue balloon color
          blueDark: '#6D92B0',    // Darker steel blue for text/buttons
          blueLight: '#D9E8F5',   // Very soft blue tint
          charcoal: '#2D2B2A',    // Script text soft charcoal/black
          gray: '#EBE7DF',        // Ripped paper shadow/border gray
          silver: '#E1E7EC',      // Disco ball silver
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        cursive: ['Caveat', 'cursive'],
        serif: ['Cinzel', 'serif'],
        playfair: ['Playfair Display', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
