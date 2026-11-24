/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Vàng gold lấy từ logo BS Realty.
        brand: {
          50: '#faf6ec',
          100: '#f3e9cc',
          300: '#dcc283',
          500: '#c09a4a',
          600: '#a07d34',
          700: '#83652a',
          900: '#4a3a18',
        },
        // Nền tối của logo.
        ink: {
          DEFAULT: '#282924',
          800: '#1f201c',
          900: '#161613',
        },
        accent: '#c09a4a',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'fade-in': 'fade-in .6s ease',
      },
      boxShadow: {
        card: '0 4px 18px rgba(40, 41, 36, 0.08)',
      },
    },
  },
  plugins: [],
};
