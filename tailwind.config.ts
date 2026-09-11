import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)", foreground: "var(--foreground)",
        card: "var(--card)", "card-foreground": "var(--card-foreground)",
        primary: "var(--primary)", "primary-foreground": "var(--primary-foreground)",
        input: "var(--input)", ring: "var(--ring)", border: "var(--border)",
      },
      fontFamily: {
        sans: ["ui-rounded", "Avenir Next", "SF Pro Rounded", "system-ui", "sans-serif"],
        display: ["Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
