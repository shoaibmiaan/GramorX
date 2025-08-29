/** @type {import('tailwindcss').Config} */
const colors = require('./design-system/tokens/colors.js'); // kept for compat if referenced
const scale = require('./design-system/tokens/scale.js');

module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Use CSS vars so slash opacity works: e.g., bg-primary/20
      colors: {
        // App base tokens
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        border:     'rgb(var(--color-border) / <alpha-value>)',

        // Brand tokens (compound = enables text-*-foreground utilities)
        primary: {
          DEFAULT:    'rgb(var(--color-primary) / <alpha-value>)',
          // fallback to lightText if --color-primary-foreground not defined
          foreground: 'rgb(var(--color-primary-foreground, var(--color-lightText)) / <alpha-value>)',
        },
        secondary: {
          DEFAULT:    'rgb(var(--color-secondary) / <alpha-value>)',
          foreground: 'rgb(var(--color-secondary-foreground, var(--color-dark)) / <alpha-value>)',
        },
        accent: {
          DEFAULT:    'rgb(var(--color-accent) / <alpha-value>)',
          foreground: 'rgb(var(--color-accent-foreground, var(--color-dark)) / <alpha-value>)',
        },

        success:       'rgb(var(--color-success) / <alpha-value>)',
        purpleVibe:    'rgb(var(--color-purpleVibe) / <alpha-value>)',
        vibrantPurple: 'rgb(var(--color-vibrantPurple) / <alpha-value>)',
        electricBlue:  'rgb(var(--color-electricBlue) / <alpha-value>)',
        neonGreen:     'rgb(var(--color-neonGreen) / <alpha-value>)',
        sunsetOrange:  'rgb(var(--color-sunsetOrange) / <alpha-value>)',
        sunsetRed:     'rgb(var(--color-sunsetRed) / <alpha-value>)',
        goldenYellow:  'rgb(var(--color-goldenYellow) / <alpha-value>)',

        // Neutrals
        dark:        'rgb(var(--color-dark) / <alpha-value>)',
        darker:      'rgb(var(--color-darker) / <alpha-value>)',
        lightBg:     'rgb(var(--color-lightBg) / <alpha-value>)',
        lightText:   'rgb(var(--color-lightText) / <alpha-value>)',
        grayish:     'rgb(var(--color-grayish) / <alpha-value>)',
        lightCard:   'rgb(var(--color-lightCard) / <alpha-value>)',
        lightBorder: 'rgb(var(--color-lightBorder) / <alpha-value>)',
        mutedText:   'rgb(var(--color-mutedText) / <alpha-value>)',

        body:        'rgb(var(--color-body) / <alpha-value>)',
        error:       'rgb(var(--color-error) / <alpha-value>)',

        // Components
        card: {
          DEFAULT:    'rgb(var(--color-lightCard) / <alpha-value>)',
          foreground: 'rgb(var(--color-lightText) / <alpha-value>)',
        },
      },

      borderRadius: {
        ds: scale.radius.lg,
        'ds-xl': scale.radius.xl,
        'ds-2xl': scale.radius['2xl'],
      },
      spacing: { ...scale.spacing },
      fontSize: { ...scale.typeScale },

      boxShadow: {
        glow:   '0 10px 20px rgba(157,78,221,0.3)',
        glowLg: '0 20px 30px rgba(157,78,221,0.3)',
      },

      fontFamily: {
        sans: ['var(--font-sans)', 'Poppins', 'ui-sans-serif'],
        slab: ['var(--font-display)', 'Roboto Slab', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
