import type { Config } from "tailwindcss";

// Frænd design system tokens (see docs/design-system.md).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rosa: { 100: "#FFEDF3", 300: "#FFC9DB", 500: "#FFA6C3", 700: "#D9708F" },
        gull: { 100: "#F8F1E2", 300: "#EEDDB8", 500: "#E0C68D", 700: "#9C7F3E" },
        sort: { 700: "#2B2B2B", 900: "#141414" },
        gra: { 100: "#F1EEEA", 300: "#CFCAC4", 500: "#7A7672" },
        krem: "#FBF8F4",
        gronn: { 600: "#4F7A52" },
        rod: { 600: "#B8463C" },
      },
      fontFamily: {
        sans: ["Jost", "Futura", "Century Gothic", "sans-serif"],
        script: ["Sacramento", "cursive"],
      },
      letterSpacing: {
        caps: "0.16em",
        wordmark: "0.28em",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,20,20,.06), 0 8px 24px rgba(20,20,20,.06)",
      },
      transitionDuration: { DEFAULT: "140ms" },
    },
    // Square corners: 0 to 4px, no pills.
    borderRadius: {
      none: "0",
      sm: "2px",
      DEFAULT: "2px",
      md: "2px",
      lg: "2px",
      xl: "4px",
      "2xl": "4px",
      full: "4px",
    },
  },
  plugins: [],
};

export default config;
