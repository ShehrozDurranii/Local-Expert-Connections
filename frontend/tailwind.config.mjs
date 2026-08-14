/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          active: '#1E40AF',
        },
        secondary: {
          DEFAULT: '#64748B',
        },
        success: {
          DEFAULT: '#16A34A',
        },
        warning: {
          DEFAULT: '#F59E0B',
        },
        error: {
          DEFAULT: '#DC2626',
        },
        info: {
          DEFAULT: '#0EA5E9',
        },
        background: {
          primary: '#FFFFFF',
          secondary: '#F8FAFC',
          sidebar: '#F1F5F9',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
          disabled: '#94A3B8',
          inverse: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E2E8F0',
          hover: '#CBD5E1',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '1280px',
      },
    },
  },
  plugins: [],
};

export default config;
