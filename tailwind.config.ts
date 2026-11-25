import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        imperium: {
          charcoal: "#0E0E0E",
          surface: "#161616",
          card: "#1C1C1C",
          cardHover: "#242424",
          border: "#2E2A24",
          gold: "#C9A24B",
          goldHover: "#DBB35B",
          goldDark: "#9A7B32",
          goldMuted: "rgba(201, 162, 75, 0.15)",
          ivory: "#F5EFE0",
          creamMuted: "#C5BDB0",
          green: "#1F3D2E",
          greenBright: "#10B981",
          greenDark: "#13281E",
          redAccent: "#DC2626",
          redDark: "#7F1D1D"
        }
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(201, 162, 75, 0.3)',
        'gold-sm': '0 0 10px rgba(201, 162, 75, 0.2)',
        'neon-green': '0 0 15px rgba(16, 185, 129, 0.4)',
        'drawer': '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A24B 0%, #E8D092 50%, #B88E35 100%)',
        'gold-gradient-dark': 'linear-gradient(135deg, rgba(201, 162, 75, 0.2) 0%, rgba(201, 162, 75, 0.05) 100%)',
        'hero-gradient': 'radial-gradient(ellipse at center, rgba(31, 61, 46, 0.35) 0%, rgba(14, 14, 14, 0.95) 85%)',
        'radial-pattern': 'radial-gradient(circle at 50% 50%, rgba(201, 162, 75, 0.08) 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
};
export default config;
