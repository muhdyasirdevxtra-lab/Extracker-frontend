/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#103F60",
        success: "#22c55e",
        expense: "#ef4444",
        savings: "#3b82f6",
        warning: "#f97316",
        analytics: "#a855f7",
        background: "#f3f4f6", // Light gray for mobile app background
        surface: "#ffffff"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
