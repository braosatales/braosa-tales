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
            200: '#AFA9EC',
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
          muted: '#8A7E9A',
        },
      },
      fontFamily: {
        cinzel: ['var(--font-cinzel)', 'Georgia', 'serif'],
        fell: ['var(--font-fell)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
