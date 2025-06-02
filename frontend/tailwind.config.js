/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1F2937",
          light: "#374151",
          dark: "#111827",
        },
        accent: {
          DEFAULT: "#16A34A",
          light: "#22C55E",
          dark: "#15803D",
        },
        warning: {
          DEFAULT: "#F59E0B",
        },
        error: {
          DEFAULT: "#DC2626",
        },
        neutral: {
          light: "#F3F4F6",
          DEFAULT: "#E5E7EB",
          dark: "#9CA3AF",
        },
        white: "#FFFFFF",
        black: "#000000",
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui'],
        heading: ['"Montserrat"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

