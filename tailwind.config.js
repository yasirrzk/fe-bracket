/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Swiss Grid / Modern Scoreboard Palette (DESIGN.md)
        canvas: '#F4F4F5',
        surface: {
          DEFAULT: '#FFFFFF',
          hover: '#FAFAFA',
        },
        ink: {
          primary: '#09090B',
          secondary: '#52525B',
          muted: '#A1A1AA',
        },
        border: {
          subtle: '#E4E4E7',
          strong: '#18181B',
        },
        accent: {
          primary: '#0052FF',
        },
        // Match & Standings Semantic Colors
        live: '#EF4444',
        win: '#10B981',
        draw: '#A1A1AA',
        loss: '#E11D48',

        // Transition bridge for components being migrated
        nb: {
          bg: '#F4F4F5',
          card: '#FFFFFF',
          cardAlt: '#FAFAFA',
          cardHover: '#F4F4F5',
          ink: '#09090B',
          black: '#18181B',
          paper: '#FFFFFF',
          yellow: '#0052FF',
          yellowHover: '#0043D4',
          red: '#E11D48',
          green: '#10B981',
          blue: '#0052FF',
          muted: '#71717A',
        }
      },
      boxShadow: {
        // Hard ban on drop shadows (DESIGN.md) - neutralized to none
        'none': 'none',
        'brutal': 'none',
        'brutal-sm': 'none',
        'brutal-lg': 'none',
        'brutal-xl': 'none',
        'brutal-yellow': 'none',
        'brutal-red': 'none',
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderWidth: {
        DEFAULT: '1px',
        '1': '1px',
        '3': '1px', // Normalizes legacy 3px brutal borders down to 1px hairline
      }
    },
  },
  plugins: [],
}
