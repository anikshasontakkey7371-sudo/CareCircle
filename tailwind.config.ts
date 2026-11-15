import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        parchment: {
          50: "#FCFAF7",
          100: "#FAF7F2",
          200: "#F4EFEA",
          300: "#EAE2D8",
          400: "#D8CDBD",
          500: "#B8A995",
        },
        terracotta: {
          50: "#FBF3F0",
          100: "#F6E5DE",
          200: "#EDC7B9",
          300: "#E1A18C",
          400: "#D3795C",
          500: "#C85A32",
          600: "#B24924",
          700: "#923919",
          800: "#752E15",
          900: "#602713",
        },
        sage: {
          50: "#F2F7F4",
          100: "#E2ECE6",
          200: "#C4D8CD",
          300: "#9EBFAD",
          400: "#6EA086",
          500: "#498365",
          600: "#38684F",
          700: "#2D5A46",
          800: "#254637",
          900: "#1E3A2E",
        },
        ochre: {
          50: "#FCF8ED",
          100: "#F8F0D5",
          200: "#F1E0A8",
          300: "#E9CD73",
          400: "#E1B842",
          500: "#D99B26",
          600: "#BC7A1B",
          700: "#945817",
        },
        charcoal: {
          800: "#222D27",
          900: "#19241E",
          950: "#0F1612",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "sans-serif",
        ],
      },
      fontSize: {
        "senior-sm": ["1.125rem", { lineHeight: "1.75rem" }],
        "senior-base": ["1.25rem", { lineHeight: "1.875rem" }],
        "senior-lg": ["1.5rem", { lineHeight: "2rem" }],
        "senior-xl": ["1.875rem", { lineHeight: "2.375rem" }],
        "senior-2xl": ["2.25rem", { lineHeight: "2.75rem" }],
        "senior-3xl": ["3rem", { lineHeight: "3.5rem" }],
      },
      boxShadow: {
        warm: "0 4px 20px -2px rgba(45, 90, 70, 0.08), 0 2px 6px -1px rgba(200, 90, 50, 0.04)",
        "warm-lg": "0 10px 30px -4px rgba(45, 90, 70, 0.12), 0 4px 12px -2px rgba(200, 90, 50, 0.06)",
        "tactile": "0 6px 0 0 #B24924, 0 10px 20px rgba(0,0,0,0.1)",
        "tactile-active": "0 2px 0 0 #B24924, 0 4px 10px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};

export default config;

