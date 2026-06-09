import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: "#f8fafc", 100: "#e2e8f0", 200: "#cbd5e1",
          300: "#94a3b8", 400: "#64748b", 500: "#475569",
          600: "#334155", 700: "#1e293b", 800: "#0f172a",
          900: "#0a0a0a",
        },
        accent: {
          DEFAULT: "#06b6d4", light: "#22d3ee", dark: "#0891b2",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
