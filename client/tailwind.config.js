/** @type {import('tailwindcss').Config} */
// Princess Christmas theme: rounded Fredoka headings (font-serif is mapped to it so every page's headings match),
// Nunito body text, and a Dancing Script accent for the "Sparkle Bows" name.
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        serif: ["Fredoka", "Nunito", "system-ui", "sans-serif"],
        display: ["Fredoka", "Nunito", "system-ui", "sans-serif"],
        script: ["Dancing Script", "cursive"],
      },
      colors: {
        royal: { 50: "#faf5ff", 100: "#f3e8ff", 200: "#e9d5ff", 300: "#d8b4fe", 400: "#c084fc", 500: "#a855f7", 600: "#9333ea", 700: "#7e22ce", 800: "#6b21a8", 900: "#3b0764", 950: "#1e0533" },
        candy: { 50: "#fff0f7", 100: "#ffe1ef", 200: "#ffc2df", 300: "#ff94c6", 400: "#ff5fa8", 500: "#ff2d87", 600: "#e0136d", 700: "#b80a57" },
        gold: { 200: "#fff3a3", 300: "#ffe066", 400: "#ffcc33", 500: "#e0a800" },
        holly: { 500: "#16a34a", 700: "#14532d" },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
