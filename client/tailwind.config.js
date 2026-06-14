/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        ocean: "#0f766e",
        mint: "#2dd4bf",
        amberline: "#f59e0b"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
};
