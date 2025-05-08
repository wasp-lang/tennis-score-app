const { resolveProjectPath } = require("wasp/dev");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [resolveProjectPath("./src/**/*.{js,ts,jsx,tsx}")],
  theme: {
    extend: {
      colors: {
        forest: "#2E5A27",
        navy: "#1B2838",
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
