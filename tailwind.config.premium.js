/** Premium Tailwind Config (for building public/premium.css)
 *  - Use a 'pr-' prefix so styles don't collide with the main site.
 *  - Map utilities to CSS variables defined in styles/premium.css.
 */
const scale = require('./design-system/tokens/scale.js');
module.exports = {
  darkMode: ['class', '[data-pr-theme="carbon"]'],
  prefix: 'pr-',
  content: [
    './premium-ui/**/*.{ts,tsx,js,jsx}',
    './stories/**/*.{ts,tsx,js,jsx,mdx}',
    './pages/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--pr-bg)',
        fg: 'var(--pr-fg)',
        card: 'var(--pr-card)',
        border: 'var(--pr-border)',
        primary: 'var(--pr-primary)',
        on: {
          primary: 'var(--pr-on-primary)',
        },
        accent: 'var(--pr-accent)',
        danger: 'var(--pr-danger)',
        warning: 'var(--pr-warning)',
        success: 'var(--pr-success)',
      },
      borderRadius: {
        xl: 'var(--pr-radius)',
        '2xl': 'calc(var(--pr-radius) + 8px)',
      },
      boxShadow: {
        md: 'var(--pr-shadow-md)',
        lg: 'var(--pr-shadow-lg)',
        ring: 'var(--pr-ring)',
      },
      transitionDuration: {
        150: '150ms',
        200: '200ms',
      },
      fontSize: { ...scale.typeScale },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
