export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        risk: {
          low: "#16a34a",      // green-600
          medium: "#d97706",   // amber-600
          high: "#dc2626",     // red-600
          unknown: "#71717a",  // zinc-500
        },
      },
    },
  },
  plugins: [],
};