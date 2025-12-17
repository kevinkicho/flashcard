/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  darkMode: 'class', // Manual toggling via JS
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        jp: ['Noto Sans JP', 'sans-serif'],
        // English Font Options
        inter: ['Inter', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      colors: {
        // Deep Purple / Black Theme for Dark Mode
        dark: {
          bg: '#050505',       // Almost pure black background
          card: '#0a0a0a',     // Slightly lighter black for cards
          border: '#1f1f1f',   // Subtle dark gray border
          primary: '#7c3aed',  // Violet 600 (Main Action Color)
          accent: '#a78bfa',   // Violet 400 (Highlights)
          text: '#e5e5e5',     // Off-white text
          muted: '#737373'     // Gray text
        }
      }
    },
  },
  plugins: [],
}
