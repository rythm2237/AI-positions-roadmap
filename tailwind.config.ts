// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "sans-serif"],
      },
      colors: {
        // Dark background scale
        dark: {
          50:  "#e8eaf6",
          100: "#c5cae9",
          200: "#9fa8da",
          300: "#7986cb",
          400: "#5c6bc0",
          500: "#3949ab",
          600: "#303f9f",
          700: "#283593",
          800: "#1a1f3a",
          900: "#0d1117",
          950: "#050814",
        },
        // AI indigo
        ai: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        // Electric cyan
        cyber: {
          50:  "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
      },
      backgroundImage: {
        "neural-gradient":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139,92,246,0.1) 0%, transparent 50%), linear-gradient(180deg, #050814 0%, #0a0f23 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)",
        "hero-gradient":
          "radial-gradient(ellipse 100% 80% at 50% -10%, rgba(99,102,241,0.2) 0%, transparent 55%)",
        "glow-gradient":
          "linear-gradient(135deg, #4f46e5, #7c3aed, #06b6d4)",
      },
      boxShadow: {
        "glow-sm":   "0 0 15px rgba(99,102,241,0.3)",
        "glow-md":   "0 0 30px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.15)",
        "glow-lg":   "0 0 60px rgba(99,102,241,0.5), 0 0 120px rgba(99,102,241,0.2)",
        "glow-cyan": "0 0 30px rgba(34,211,238,0.4), 0 0 60px rgba(34,211,238,0.15)",
        "card":      "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05)",
        "card-hover":"0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.15)",
        "glass":     "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        "premium":   "0 25px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.2)",
      },
      animation: {
        "neural-pulse":   "neural-pulse 3s ease-in-out infinite",
        "float":          "float 6s ease-in-out infinite",
        "glow-pulse":     "glow-pulse 3s ease-in-out infinite",
        "fade-in-up":     "fade-in-up 0.6s ease forwards",
        "fade-in":        "fade-in 0.5s ease forwards",
        "slide-in-right": "slide-in-right 0.5s ease forwards",
        "rotate-slow":    "rotate-slow 20s linear infinite",
        "border-flow":    "border-flow 4s ease infinite",
        "shimmer":        "shimmer 2s infinite",
        "scan-line":      "scan-line 4s linear infinite",
      },
      keyframes: {
        "neural-pulse": {
          "0%,100%": { opacity: "0.35", transform: "scale(1)" },
          "50%":      { opacity: "0.9",  transform: "scale(1.12)" },
        },
        "float": {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%,100%": { boxShadow: "0 0 20px rgba(99,102,241,0.3)" },
          "50%":     { boxShadow: "0 0 40px rgba(99,102,241,0.7), 0 0 80px rgba(139,92,246,0.3)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(32px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "rotate-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        "border-flow": {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "scan-line": {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.23, 1, 0.32, 1)",
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      blur: {
        "4xl": "80px",
        "5xl": "120px",
      },
    },
  },
  plugins: [],
};

export default config;
