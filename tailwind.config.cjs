/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx,mdx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        background: '#FAFAF9',
        foreground: '#111827',
        primary: {
          DEFAULT: '#1D4ED8',
          400: '#3B82F6',
        },
        muted: '#6B7280',
        border: '#E5E7EB',
        success: '#166534',
        warning: '#B45309',
        danger: '#B91C1C',
        card: '#FFFFFF',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
