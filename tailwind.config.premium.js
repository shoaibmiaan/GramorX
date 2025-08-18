/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/premium-ui/**/*.{js,ts,jsx,tsx}",
    "./pages/premium/**/*.{js,ts,jsx,tsx}",
    "./styles/premium.css",
    "./styles/premium-theme.css",
  ],
  darkMode: "class",
  prefix: "pr-",
  theme: {
    extend: {
      fontFamily: {
        premium: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        bg: "rgb(var(--pr-bg) / <alpha-value>)",
        surface: "rgb(var(--pr-surface) / <alpha-value>)",
        text: "rgb(var(--pr-text) / <alpha-value>)",
        muted: "rgb(var(--pr-muted) / <alpha-value>)",
        primary: "rgb(var(--pr-primary) / <alpha-value>)",
        primaryFg: "rgb(var(--pr-primary-fg) / <alpha-value>)",
        ring: "rgb(var(--pr-ring) / <alpha-value>)",
        border: "rgb(var(--pr-border) / <alpha-value>)",
        accent: "rgb(var(--pr-accent) / <alpha-value>)",
        accentFg: "rgb(var(--pr-accent-fg) / <alpha-value>)",
        success: "rgb(var(--pr-success) / <alpha-value>)",
        warning: "rgb(var(--pr-warning) / <alpha-value>)",
        danger: "rgb(var(--pr-danger) / <alpha-value>)",
      },
      borderRadius: { xl: "14px", "2xl": "22px" },
      boxShadow: { glass: "0 8px 24px rgba(0,0,0,0.12)", soft: "0 6px 16px rgba(0,0,0,0.10)" },
      backdropBlur: { 12: "12px" },
      keyframes: {
        "fade-in": { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        pop: { "0%": { transform: "scale(.96)", opacity: 0 }, "100%": { transform: "scale(1)", opacity: 1 } },
      },
      animation: { "fade-in": "fade-in .25s ease-out", "pop-in": "pop .2s ease-out" },
    },
  },
  plugins: [],
};
