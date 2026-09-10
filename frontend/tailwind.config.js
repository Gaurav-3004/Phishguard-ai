/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#080B10",
          800: "#0C1119",
          700: "#111826",
          600: "#161F30",
        },
        signal: {
          DEFAULT: "#00D9B5", // primary accent — analysis / active state
          dim: "#0A6E5C",
        },
        alert: {
          DEFAULT: "#FF5D73", // high risk / danger
          dim: "#5C1F2A",
        },
        caution: {
          DEFAULT: "#FFB454", // suspicious / medium
        },
        safe: {
          DEFAULT: "#3DDC97", // safe / positive
        },
        mist: {
          DEFAULT: "#C9D4E0", // primary text on dark
          muted: "#7C8A9E", // secondary text
          faint: "#4A5568",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,217,181,0.18), 0 8px 30px -12px rgba(0,217,181,0.25)",
        "glow-alert": "0 0 0 1px rgba(255,93,115,0.25), 0 8px 30px -12px rgba(255,93,115,0.35)",
      },
      backgroundImage: {
        "grid-fade": "linear-gradient(180deg, rgba(0,217,181,0.06) 0%, rgba(0,0,0,0) 60%)",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(0,217,181,0.35)" },
          "100%": { boxShadow: "0 0 0 14px rgba(0,217,181,0)" },
        },
      },
      animation: {
        scan: "scan 2.2s linear infinite",
        pulseRing: "pulseRing 1.6s ease-out infinite",
      },
    },
  },
  plugins: [],
};
