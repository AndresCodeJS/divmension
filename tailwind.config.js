/** @type {import('tailwindcss').Config} */
/* module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
} */
  module.exports = {
    content: ["./src/**/*.{html,js,ts}"],
    theme: {
      extend: {},
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        'black': '#222222',
        'gray-light': '#E9E9E9',
        'gray-medium': '#DDDDDD',
        'gray-dark':'#9c9a9a',
        'gray-heavy' : '#3E3E3E',
        'gray-hover' : '#404040',
        'yellow': "#FFF083",
        "orange": "#FD4B3D",
        "white": "#FFFFFF",
        "green": "#32a852"
      },
    },
    plugins: [],
  }

