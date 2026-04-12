/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(56,189,248,.35), 0 12px 40px rgba(56,189,248,.2)",
      },
    },
  },
  plugins: [],
};
