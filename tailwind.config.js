/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f4fb',
          100: '#ebe9f7',
          200: '#d7d4ef',
          500: '#5c52b8',
          DEFAULT: '#3C3489',
          dark: '#2d276b',
        },
        cream: {
          50: '#FFFCF9',
          DEFAULT: '#FDF8F2',
          100: '#F7EFE4',
          200: '#EFE5D5',
        },
        amber: {
          badge: '#FDA412',
          badgeHover: '#E6930A',
        },
        trust: {
          green: '#02804D',
          greenLight: 'rgba(2, 128, 77, 0.1)',
        }
      },
      fontFamily: {
        serif: ['Lora', 'serif'],
        sans: ['"DM Sans"', 'Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(60, 52, 137, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 28px -4px rgba(60, 52, 137, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
