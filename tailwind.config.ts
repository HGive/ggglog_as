import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ['var(--font-pretendard)'],
        epilogue: ['var(--font-epilogue)'],
      },
      colors: {
        primary: '#000000',
        secondary: '#666666',
        border: '#e5e5e5',
      },
    },
  },
  plugins: [],
}
export default config
