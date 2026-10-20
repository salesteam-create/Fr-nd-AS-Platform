import type { Config } from "tailwindcss";

// Placeholder brand palette. Swap these values once Frænd's brand assets arrive.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f6f2",
          100: "#dce9df",
          200: "#b8d3bf",
          300: "#8ab599",
          400: "#5e9373",
          500: "#3f7657",
          600: "#2f5e44",
          700: "#264b37",
          800: "#1f3d2d",
          900: "#183025",
        },
        cream: {
          50: "#fdfbf7",
          100: "#f8f3ea",
          200: "#efe5d3",
        },
        accent: {
          400: "#e08560",
          500: "#c9653f",
          600: "#a94f2f",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
