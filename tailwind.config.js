/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nb: {
          bg: 'var(--nb-bg)',
          card: 'var(--nb-card)',
          cardAlt: 'var(--nb-card-alt)',
          cardHover: 'var(--nb-card-hover)',
          ink: 'var(--nb-text)',
          black: 'var(--nb-border)',
          paper: '#FAF6ED',
          yellow: 'var(--nb-yellow)',
          yellowHover: 'var(--nb-yellow-hover)',
          red: 'var(--nb-red)',
          green: 'var(--nb-green)',
          blue: 'var(--nb-blue)',
          muted: 'var(--nb-muted)',
        }
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px var(--nb-border)',
        'brutal-sm': '2px 2px 0px 0px var(--nb-border)',
        'brutal-lg': '6px 6px 0px 0px var(--nb-border)',
        'brutal-xl': '8px 8px 0px 0px var(--nb-border)',
        'brutal-yellow': '4px 4px 0px 0px var(--nb-yellow)',
        'brutal-red': '4px 4px 0px 0px var(--nb-red)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}
