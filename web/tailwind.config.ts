import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: [
          '"Noto Serif SC"',
          '"Source Han Serif SC"',
          'Georgia',
          'serif',
        ],
      },
      colors: {
        ink: {
          DEFAULT: '#1a1a1a',
          muted: '#6b6b6b',
        },
        paper: {
          DEFAULT: '#fafaf7',
          dark: '#15151a',
        },
      },
    },
  },
  plugins: [],
}

export default config
