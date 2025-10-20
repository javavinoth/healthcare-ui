/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors - Trust & Professionalism (Blue-focused)
        primary: {
          dark: '#1e3e72',
          DEFAULT: '#23408e',
          light: '#63c8f2',
          bright: '#16c2d5',
        },
        secondary: {
          cyan: '#89dee2',
        },
        // Wellness & Growth (Green accents)
        wellness: {
          DEFAULT: '#5aba4a',
          sage: '#c7d0c4',
          accent: '#90f035',
        },
        // Neutral palette
        neutral: {
          navy: '#10217d',
          'blue-gray': '#527c88',
          light: '#f5f7f9',
        },
        // Status colors
        success: '#5aba4a',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#16c2d5',
        // shadcn/ui compatible colors
        border: 'hsl(214.3 31.8% 91.4%)',
        input: 'hsl(214.3 31.8% 91.4%)',
        ring: '#23408e',
        background: '#ffffff',
        foreground: '#10217d',
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f5f7f9',
          foreground: '#527c88',
        },
        accent: {
          DEFAULT: '#63c8f2',
          foreground: '#10217d',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#10217d',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#10217d',
        },
      },
      fontFamily: {
        sans: ['"Open Sans"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        secondary: ['Verdana', 'Arial', 'sans-serif'],
        print: ['Georgia', '"Times New Roman"', 'serif'],
      },
      fontSize: {
        h1: ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],    // 40px
        h2: ['1.75rem', { lineHeight: '1.2', fontWeight: '700' }],   // 28px
        h3: ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],    // 24px
        h4: ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],   // 20px
        body: ['1rem', { lineHeight: '1.5', fontWeight: '400' }],    // 16px
        small: ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }], // 14px
        caption: ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }], // 12px
      },
      spacing: {
        xs: '0.25rem',  // 4px
        sm: '0.5rem',   // 8px
        md: '1rem',     // 16px
        lg: '1.5rem',   // 24px
        xl: '2rem',     // 32px
        '2xl': '3rem',  // 48px
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
