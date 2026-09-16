/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        cream: "#FBFDFF",
        milk: {
          50: "#F4F9FD",
          100: "#E7F2FA",
          200: "#CFE6F5",
        },
        dairy: {
          50: "#EFF7FC",
          100: "#DCEEF9",
          200: "#B4DBF0",
          300: "#82C1E3",
          400: "#4EA3D1",
          500: "#2A85BC",
          600: "#1D6FA8",
          700: "#175A88",
          800: "#14456A",
          900: "#0F324E",
        },
        wheat: {
          100: "#FCF3DE",
          400: "#E9AE3E",
          500: "#D9962A",
          600: "#B87A1B",
        },
        leaf: {
          500: "#2F9E63",
          600: "#268352",
        },
        clay: {
          500: "#D6584A",
          600: "#B7453A",
        },
        ink: "#12293D",
      },
      boxShadow: {
        soft: "0 2px 14px rgba(15, 50, 78, 0.07)",
        card: "0 1px 3px rgba(15, 50, 78, 0.08), 0 8px 24px rgba(15, 50, 78, 0.05)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        dropPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.06)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.35s ease-out",
        dropPulse: "dropPulse 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
