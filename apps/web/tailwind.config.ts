import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cinenova: {
          void: '#05070b',
          surface: '#0b0d12',
          panel: '#11141b',
          panel2: '#171a22',
          line: '#2d323d',
          ivory: '#f5f0e8',
          muted: '#c9c5bf',
          accent: '#e46b4a',
          'accent-strong': '#f27b5a',
          amber: '#d49a48',
        },
      },
      boxShadow: {
        glow: '0 0 32px rgba(228,107,74,0.35)',
        card: '0 24px 80px rgba(0,0,0,0.42)',
      },
      fontFamily: {
        sans: ['var(--font-cinenova)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
