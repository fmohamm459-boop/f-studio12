import type { Config } from "tailwindcss";

// Design tokens sourced from Page_Structure.md PART C and UI_Guidelines.md §18.
// Locked palette (max 5 colors incl. neutrals per UI_Guidelines §19.7 "No more than 5 colors").
// Locked type families (max 2 font families per UI_Guidelines §19.7).
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#fbf9f9", // background / surface base
        ink: "#1c1b1b", // foreground / text base
        teal: {
          DEFAULT: "#008080", // --primary, signal color only (<=10% of any screen)
          foreground: "#fbf9f9",
        },
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-elevated": "var(--surface-elevated)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
      },
      fontFamily: {
        sans: ["var(--font-hanken-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-technical-mono)", "ui-monospace", "monospace"],
      },
      spacing: {
        // Section rhythm per UI_Guidelines §19.1 (py-16 -> py-32)
      },
      borderRadius: {
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        // --shadow-* scale referenced by UI_Guidelines §18.9 / §20.8 (values TBD by design token export)
      },
      keyframes: {},
      animation: {},
      transitionDuration: {
        micro: "150ms", // UI_Guidelines §19.2 — functional micro-interactions, 120-180ms
      },
    },
  },
  plugins: [],
};

export default config;
