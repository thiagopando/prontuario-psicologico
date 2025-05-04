/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./public/**/*.html",
      "./src/**/*.js"
    ],
    theme: {
      extend: {
        colors: {
          primary: '#4bb3fd',
          secondary: '#ffc738',
          dark: '#121331',
        },
      },
    },
    plugins: [],
  }
  