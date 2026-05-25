import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0b0d12",
          soft: "#11141b",
          card: "#161a23",
          hover: "#1c2230",
        },
        border: {
          DEFAULT: "#222838",
          soft: "#1a1f2c",
        },
        brand: {
          DEFAULT: "#7c5cff",
          hover: "#8e72ff",
          soft: "#7c5cff20",
        },
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03), 0 1px 2px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
