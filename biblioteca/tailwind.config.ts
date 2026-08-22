import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        paper: "#fbfaf7",
        line: "#d7dedc",
        teal: "#176b68",
        fern: "#6e8b55",
        brick: "#b6533c",
        brass: "#a77a22"
      },
      fontFamily: {
        sans: ["var(--font-sans)"]
      },
      boxShadow: {
        panel: "0 18px 48px rgba(23, 32, 51, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
