/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        LogoFont: ["LogoFont", "sans-serif"], // Add this line
      },
      colors: {
        "web-red": "#ea2e0e",
      },
    },
  },
  plugins: [],
};
