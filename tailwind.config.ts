import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm paper palette
        bg: '#FAF8F4',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#1E2024',
          muted: '#6B6F76',
        },
        hairline: '#E6E2DA',
        accent: {
          DEFAULT: '#4A6B8A',
          hover: '#3A5670',
          subtle: '#E8EEF3',
        },
        destructive: '#A85A4A',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Inter',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(30,32,36,0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
