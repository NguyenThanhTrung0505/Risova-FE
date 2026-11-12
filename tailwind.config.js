/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'Segoe UI', 'Inter', 'sans-serif'],
      },
      colors: {
        risova: {
          bg: '#F9F7F7',
          surface: '#DBE2EF',
          primary: '#3F72AF',
          'primary-hover': '#325d91',
          dark: '#112D4E',
          'dark-sidebar': '#112D4E',
          'sidebar-group': '#7F96B0',
          'sidebar-text': '#DBE2EF',
          'text-main': '#112D4E',
          'text-secondary': '#64748B',
          border: '#E2E8F0',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontSize: {
        'page-title': ['26px', { lineHeight: '32px', fontWeight: '700' }],
        'section-title': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'card-title': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-medium': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label': ['13px', { lineHeight: '18px', fontWeight: '500' }],
        'table-text': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'btn': ['14px', { lineHeight: '20px', fontWeight: '600' }],
      }
    },
  },
  plugins: [],
}
