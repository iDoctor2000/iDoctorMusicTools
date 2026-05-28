/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        space: {
          black: "#020617",
          deep: "#030712",
          night: "#0F172A",
        },
        neon: {
          cyan: "#22D3EE",
          sky: "#38BDF8",
          violet: "#8B5CF6",
          magenta: "#D946EF",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui"],
        orbitron: ["Orbitron", "Space Grotesk", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 211, 238, 0.26)",
        violetGlow: "0 0 48px rgba(139, 92, 246, 0.24)",
        magentaGlow: "0 0 48px rgba(217, 70, 239, 0.22)",
      },
      backgroundImage: {
        "cosmic-radial":
          "radial-gradient(circle at 20% 20%, rgba(34, 211, 238, 0.16), transparent 32%), radial-gradient(circle at 75% 12%, rgba(217, 70, 239, 0.16), transparent 30%), radial-gradient(circle at 50% 80%, rgba(139, 92, 246, 0.14), transparent 34%)",
      },
    },
  },
  plugins: [],
};
