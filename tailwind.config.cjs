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
    },
  },
  plugins: [],
};
