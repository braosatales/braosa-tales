import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0A0712',
          card: '#130F1E',
          border: '#2A2040',
          purple: {
            50:  '#EEEDFE',
            200: '#F0E8FF',
            400: '#7F77DD',
            600: '#534AB7',
            800: '#3C3489',
            900: '#26215C',
          },
          gold: {
            300: '#E8C97A',
            400: '#C4960A',
            500: '#9A7208',
          },
          parchment: '#F0E4C4',
          muted: '#C8B8D8',
        },
        // 2026 refresh — readable, warmer, two "rooms": tavern (sessions) and workshop (atelier)
        night: '#0F0B16',      // page
        plum: { DEFAULT: '#1A1424', line: '#2E2440' },          // workshop surfaces
        umber: { DEFAULT: '#1C130C', deep: '#140D08', line: '#3D2A1B' }, // tavern surfaces
        vellum: '#F3E9D2',     // headings
        prose: '#DCD2E6',      // body text
        mist: '#A99DBC',       // secondary text
        leaf: { DEFAULT: '#D4AE58', soft: '#E8CF8E', deep: '#9C7A2F' }, // gold leaf
        ember: '#C98B4E',      // warm accent on brown
        amethyst: { DEFAULT: '#8F87E6', deep: '#534AB7' },
      },
      fontFamily: {
        cinzel: ['var(--font-cinzel)', 'Georgia', 'serif'],
        fell: ['var(--font-fell)', 'Georgia', 'serif'],
        text: ['var(--font-fell)', 'Georgia', 'serif'],
      },
      maxWidth: { measure: '34em' },
    },
  },
  plugins: [],
}

export default config
