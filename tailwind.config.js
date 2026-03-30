/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          sand: "#d9ccb8",
          wine: "#67343c",
          ivory: "#f7f3ed",
          charcoal: "#2d2525"
        }
      },
      fontFamily: {
        heading: ["Cormorant Garamond", "serif"],
        body: ["Manrope", "sans-serif"]
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        floatIn: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      },
      animation: {
        fadeUp: "fadeUp 0.6s ease-out both",
        floatIn: "floatIn 0.8s ease-out both"
      }
    }
  },
  plugins: []
};
