/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F5F3F1",
        sidebar: "#EEE8E3",
        card: "#FFFFFF",
        primary: "#7A5C4D",
        primaryHover: "#6A4E41",
        accent: "#C9A88F",
        text: "#2E2A27",
        textLight: "#7B746E",
        border: "#E6E1DC"
      },
      borderRadius: {
        'xl': '14px',
      },
      boxShadow: {
        'soft': '0 8px 20px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}