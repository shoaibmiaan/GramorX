/** @type {import('tailwindcss').Config} */
const colors = require('./design-system/tokens/colors.js'); // kept for compat if referenced
const scale = require('./design-system/tokens/scale.js');

module.exports = {
  darkMode: ['class'],
  future: {
    // Avoids sticky hover on touch devices; safe QoL improvement
    hoverOnlyWhenSupported: true,
  },
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './design-system/**/*.{js,ts,jsx,tsx,css,mdx}', // include DS files
  ],

  // Keep a small safelist for tokenized classes that are often generated dynamically
  safelist: [
    // Text & background with brand tokens
    { pattern: /(bg|text|border)-(primary|secondary|accent)(\/\d{2})?/ },
    // State overlays often used in DS components
    'bg-primary/10', 'bg-accent/10', 'text-primary', 'text-accent',
    // Ring colors that follow border token
    'ring-border', 'focus:ring-border',
    // Light/dark toggles on core surfaces
    'bg-background', 'text-foreground', 'border-border',
    // Card compound
    'bg-card', 'text-card-foreground',
  ],

  theme: {
    extend: {
      // ====== COLOR SYSTEM (CSS Vars → supports /opacity) ======
      colors: {
        // Base app surfaces
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        border:     'rgb(var(--color-border) / <alpha-value>)',

        // Brand (compound: enables text-*-foreground utilities)
        primary: {
          DEFAULT:    'rgb(var(--color-primary) / <alpha-value>)',
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

        // Extended brand/support tokens (from desired_design)
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

        // Components (compound)
        card: {
          DEFAULT:    'rgb(var(--color-lightCard) / <alpha-value>)',
          foreground: 'rgb(var(--color-lightText) / <alpha-value>)',
        },
      },

      // ====== TYPOGRAPHY SCALE (from DS tokens) ======
      fontSize: { ...scale.typeScale },

      // ====== RADIUS / SPACING (from DS tokens) ======
      borderRadius: {
        // DS default radii for components
        none: scale.radius.none,
        xs:   scale.radius.xs || '0.25rem', // ensure availability even if omitted
        sm:   scale.radius.sm,
        md:   scale.radius.md,
        lg:   scale.radius.lg,
        xl:   scale.radius.xl,
        '2xl': scale.radius['2xl'],
        full: scale.radius.full || '9999px',

        // Semantic aliases commonly used across the app
        ds:     scale.radius.lg,
        'ds-xl': scale.radius.xl,
        'ds-2xl': scale.radius['2xl'],
      },

      spacing: { ...scale.spacing },

      // ====== EFFECTS / FONTS ======
      boxShadow: {
        glow:   '0 10px 20px rgba(157,78,221,0.3)',
        glowLg: '0 20px 30px rgba(157,78,221,0.3)',
      },

      // Inherit fonts via CSS vars (desired_design)
      fontFamily: {
        sans: ['var(--font-sans)', 'Poppins', 'ui-sans-serif', 'system-ui'],
        slab: ['var(--font-display)', 'Roboto Slab', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },

      // Make ring/outline default to tokenized border
      ringColor: {
        DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
      },
      outlineColor: {
        DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
      },
    },
  },

  // Keep plugins minimal per your DS guide (no external styles here)
  plugins: [],
};
