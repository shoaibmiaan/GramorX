/** @type {import('tailwindcss').Config} */
const colors = require('./design-system/tokens/colors.js');
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
      colors: {
        primary: colors.primary,
        primaryDark: colors.primaryDark,
        secondary: colors.secondary,
        accent: colors.accent,
        success: colors.success,
        purpleVibe: colors.purpleVibe,
        electricBlue: colors.electricBlue,
        neonGreen: colors.neonGreen,
        sunsetOrange: colors.sunsetOrange,
        goldenYellow: colors.goldenYellow,
        dark: colors.dark,
        darker: colors.darker,
        lightBg: colors.lightBg,
        lightText: colors.lightText,
        grayish: colors.grayish,
      },
      borderRadius: {
        ds: scale.radius.lg,
        'ds-xl': scale.radius.xl,
        'ds-2xl': scale.radius['2xl'],
      },
      spacing: {
        ...scale.spacing,
      },
      fontSize: {
        ...scale.typeScale,
      },
      boxShadow: {
        glow: '0 10px 20px rgba(157,78,221,0.3)',
        glowLg: '0 20px 30px rgba(157,78,221,0.3)',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        slab: ['Roboto Slab', 'serif'],
      },
    },
  },
  plugins: [],
};
