/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1F4B",
          900: "#08183A",
          800: "#0B1F4B",
          700: "#15295C",
          600: "#23386F",
          500: "#3A4E7A",
        },
        accent: { DEFAULT: "#FF9F1C", dark: "#E88A05", light: "#FFB84D" }, // primary CTA (amber)
        teal: { DEFAULT: "#00C896", dark: "#02A87E", light: "#3FD9B0" },   // success
        danger: { DEFAULT: "#F4476B", dark: "#D7325A" },                   // error
        cream: "#F4F5FA",                                                  // app background
        ink: { DEFAULT: "#0B1F4B", soft: "#5A6B8C", faint: "#8A97B0" },    // text scale
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: { tightest: "-0.02em" },
      borderRadius: {
        card: "16px",
        xl2: "20px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11, 31, 75, 0.04), 0 4px 14px -8px rgba(11, 31, 75, 0.12)",
        card: "0 2px 6px -2px rgba(11, 31, 75, 0.06), 0 12px 28px -16px rgba(11, 31, 75, 0.16)",
        cardHover: "0 8px 20px -8px rgba(11, 31, 75, 0.18)",
        nav: "0 -6px 24px -12px rgba(11, 31, 75, 0.20)",
        ringSoft: "0 0 0 4px rgba(255, 159, 28, 0.18)",
      },
      maxWidth: { app: "480px", shell: "1100px" },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: 0, transform: "scale(0.96)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        pop: {
          "0%": { transform: "scale(0.8)", opacity: 0 },
          "60%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both",
        scaleIn: "scaleIn 0.3s cubic-bezier(0.22,1,0.36,1) both",
        pop: "pop 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
