// design-system/tokens/scale.js
module.exports = {
  radius: {
    none: '0',
    sm: '0.375rem', // 6px
    md: '0.75rem',  // 12px
    lg: '1rem',     // 16px
    xl: '1.25rem',  // 20px
    '2xl': '1.5rem' // 24px
  },
  spacing: {
    // extends Tailwind's scale with project-specific steps
    3.5: '0.875rem',  // 14px
    17.5: '4.375rem', // 70px
    18: '4.5rem',     // 72px
    22: '5.5rem',     // 88px
    30: '7.5rem',     // 120px
    220: '55rem'      // 880px
  },
  typeScale: {
    // Existing
    display: ['3rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }], // 48px
    h1: ['2.25rem', { lineHeight: '1.15' }],  // 36px
    h2: ['1.875rem', { lineHeight: '1.2' }],  // 30px
    h3: ['1.5rem', { lineHeight: '1.3' }],    // 24px
    body: ['1rem', { lineHeight: '1.6' }],    // 16px
    small: ['0.875rem', { lineHeight: '1.5' }], // 14px

    // Added (for desired_design hero / headings & fine text)
    displayLg: ['3.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }], // 56px — big hero
    h4: ['1.25rem', { lineHeight: '1.4' }],    // 20px — useful for card titles
    caption: ['0.75rem', { lineHeight: '1.4' }], // 12px — helper/labels
    tiny: ['0.6875rem', { lineHeight: '1.4' }],  // 11px — fine print
    micro: ['0.625rem', { lineHeight: '1.4' }], // 10px — micro text
  }
};
