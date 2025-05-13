/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9D4B5B',
        secundary: '#588152',
        terciary: '#ffffff',
        new: '#d2d7db'
      },
    },
  },
  plugins: [],
}