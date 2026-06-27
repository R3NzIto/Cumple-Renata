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
          cream: '#F1F5F9',       // Gris plateado muy suave para fondo
          paper: '#FFFFFF',       // Blanco puro para las tarjetas
          blue: '#1E3A8A',        // Azul marino medio (royal/navy) para acentos y botones
          blueDark: '#0F172A',    // Azul marino profundo (casi negro) para textos principales
          blueLight: '#E2E8F0',   // Gris plateado muy claro para fondos de inputs
          charcoal: '#1E293B',    // Azul pizarra oscuro para textos secundarios
          gray: '#CBD5E1',        // Gris plateado de bordes
          silver: '#94A3B8',      // Plateado metálico
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
