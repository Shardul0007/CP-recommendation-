import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#17202a",
        pine: "#0f766e",
        coral: "#f97363",
        mist: "#f7fafc"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 32, 42, 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;
