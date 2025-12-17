/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        // We define our font "variables" here
        sans: ['Inter', 'sans-serif'],
        jp: ['Noto Sans JP', 'sans-serif'],
      },
      // We can also add custom colors if we want specific branding
      colors: {
        brand: {
          light: '#4f46e5', // Indigo 600
          DEFAULT: '#4338ca', // Indigo 700
          dark: '#3730a3', // Indigo 800
        }
      }
    },
  },
  plugins: [],
}
