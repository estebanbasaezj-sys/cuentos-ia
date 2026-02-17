import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
        cream: {
          50: "#FFFDF7",
          100: "#FFF9EB",
          200: "#FFF3D6",
          300: "#FFEAB8",
          400: "#FFE0A0",
        },
        accent: {
          teal: "#2DD4BF",
          "teal-light": "#99F6E4",
          coral: "#FB7185",
          "coral-light": "#FECDD3",
          amber: "#F59E0B",
          "amber-light": "#FDE68A",
        },
      },
      fontFamily: {
        heading: ["var(--font-nunito)", "system-ui", "sans-serif"],
        body: ["var(--font-nunito)", "system-ui", "sans-serif"],
        display: ["var(--font-fredoka)", "var(--font-nunito)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "glow-purple": "0 0 20px rgba(147, 51, 234, 0.3)",
        "glow-purple-lg": "0 0 40px rgba(147, 51, 234, 0.25)",
        "card": "0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.06), 0 12px 28px rgba(0, 0, 0, 0.1)",
        "colored": "0 4px 14px rgba(147, 51, 234, 0.15)",
      },
      keyframes: {
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        blob: {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -30px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0, 0) scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "icon-glow": {
          "0%, 100%": { boxShadow: "0 4px 14px rgba(147, 51, 234, 0.3)" },
          "50%": { boxShadow: "0 4px 20px rgba(251, 191, 36, 0.35)" },
        },
        "icon-sparkle": {
          "0%, 100%": { filter: "brightness(1) drop-shadow(0 2px 4px rgba(147, 51, 234, 0.2))" },
          "50%": { filter: "brightness(1.15) drop-shadow(0 2px 8px rgba(251, 191, 36, 0.4))" },
        },
        "star-twinkle": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        "wand-magic": {
          "0%, 100%": { filter: "drop-shadow(0 0 3px rgba(251, 191, 36, 0.5))" },
          "50%": { filter: "drop-shadow(0 0 8px rgba(147, 51, 234, 0.6))" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-pop": {
          "0%": { transform: "scale(0.92)", opacity: "0.8" },
          "50%": { transform: "scale(1.03)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        gradient: "gradient 6s ease infinite",
        float: "float 3s ease-in-out infinite",
        blob: "blob 7s infinite",
        shimmer: "shimmer 2s infinite",
        "fade-in": "fade-in 0.5s ease-out both",
        "icon-glow": "icon-glow 3s ease-in-out infinite",
        "icon-sparkle": "icon-sparkle 4s ease-in-out infinite",
        "star-twinkle": "star-twinkle 2s ease-in-out infinite",
        "wand-magic": "wand-magic 3s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out both",
        "slide-in-left": "slide-in-left 0.3s ease-out both",
        "scale-pop": "scale-pop 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
