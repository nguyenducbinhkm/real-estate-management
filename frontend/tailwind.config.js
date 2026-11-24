/** @type {import('tailwindcss').Config} */
// Màu chủ đạo lấy theo logo BS Realty: vàng gold (brand/gold) trên nền nâu đen (ink).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Màu chính (nút, liên kết, giá, mục đang chọn).
        // Vàng gold của logo BS Realty (600 = #A37835, trùng nút "Tìm kiếm" ở banner trang chủ).
        brand: {
          50: '#fbf8f1',
          100: '#f5edda',
          200: '#ebdab4',
          300: '#dcc283',
          400: '#cdab65',
          500: '#c09a4a',
          600: '#a37835',
          700: '#86612b',
          800: '#6b4e25',
          900: '#4f3a1c',
        },
        // Vàng gold lấy từ logo BS Realty – dùng cho logo, nhãn VIP và điểm nhấn.
        gold: {
          50: '#faf6ec',
          100: '#f3e9cc',
          300: '#dcc283',
          500: '#c09a4a',
          600: '#a07d34',
          700: '#83652a',
        },
        // Màu chữ đậm / nền tối: nâu đen của nền logo.
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
        card: '0 2px 12px rgba(40, 41, 36, 0.06)',
        lift: '0 14px 34px rgba(40, 41, 36, 0.14)',
        search: '0 18px 50px rgba(22, 22, 19, 0.22)',
      },
    },
  },
  plugins: [],
};
