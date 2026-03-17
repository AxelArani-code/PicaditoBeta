import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        border: "var(--border)",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          active: "var(--primary-active)",
        },
        green: {
          50: "var(--green-50)",
          100: "var(--green-100)",
          200: "var(--green-200)",
          300: "var(--green-300)",
          400: "var(--green-400)",
          500: "var(--green-500)",
          600: "var(--green-600)",
          700: "var(--green-700)",
          800: "var(--green-800)",
          900: "var(--green-900)",
          950: "var(--green-950)",
        },
      },
      spacing: {
        "1": "var(--space-1)",
        "2": "var(--space-2)",
        "3": "var(--space-3)",
        "4": "var(--space-4)",
        "5": "var(--space-5)",
        "6": "var(--space-6)",
        "7": "var(--space-7)",
        "8": "var(--space-8)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      fontFamily: {
        heading: ["var(--font-raleway)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      fontSize: {
        h1: ["var(--h1)", { lineHeight: "var(--lh-heading)", fontWeight: "700" }],
        h2: ["var(--h2)", { lineHeight: "var(--lh-heading)", fontWeight: "600" }],
        h3: ["var(--h3)", { lineHeight: "var(--lh-heading)", fontWeight: "600" }],
        h4: ["var(--h4)", { lineHeight: "var(--lh-heading)", fontWeight: "600" }],
        body: ["var(--body)", { lineHeight: "var(--lh-body)", fontWeight: "400" }],
        small: ["var(--small)", { lineHeight: "var(--lh-body)", fontWeight: "400" }],
      },
    },
  },
  plugins: [],
};

export default config;
