/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
        },
        accent: {
          DEFAULT: '#a855f7',
          light: '#c084fc',
          dark: '#9333ea',
        },
        bgLight: '#f8fafc',
        bgDark: '#0f172a',
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        'gradient-light': 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        'gradient-radial-light': 'radial-gradient(circle at top left, #eef2ff 0%, #faf5ff 50%, #ede9fe 100%)',
        'gradient-radial-dark': 'radial-gradient(circle at top left, #0f172a 0%, #1e1b4b 50%, #1e293b 100%)',
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out",
        "slide-left": "slideLeft 0.6s ease-out",
        typing:
          "typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideLeft: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        typing: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        "blink-caret": {
          "from, to": { "border-color": "transparent" },
          "50%": { "border-color": "orange" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
