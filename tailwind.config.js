/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 主色
        void: "#070A12",
        abyss: "#0D1424",
        slate2: "#1B2236",
        // 强调色
        cyber: "#22E3DC",
        neon: "#FF2E88",
        amber2: "#FFB547",
        // 辅助色
        ash: "#8A95B0",
      },
      fontFamily: {
        display: ['"Orbitron"', "system-ui", "sans-serif"],
        body: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        cyber: "0 0 24px -4px rgba(34, 227, 220, 0.5)",
        "cyber-lg": "0 0 40px -4px rgba(34, 227, 220, 0.6)",
        neon: "0 0 24px -4px rgba(255, 46, 136, 0.5)",
        "inner-cyber": "inset 0 0 12px rgba(34, 227, 220, 0.35)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(34, 227, 220, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 227, 220, 0.06) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(circle at 50% 30%, rgba(34, 227, 220, 0.12), transparent 60%)",
        "scan-sweep":
          "linear-gradient(180deg, transparent 0%, rgba(34, 227, 220, 0.0) 40%, rgba(34, 227, 220, 0.55) 50%, rgba(34, 227, 220, 0.0) 60%, transparent 100%)",
      },
      backgroundSize: {
        "grid-lg": "64px 64px",
        "grid-sm": "32px 32px",
      },
      animation: {
        "scan-down": "scan-down 2.6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 1.8s ease-in-out infinite",
        "spin-slow": "spin 18s linear infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "blink": "blink 1.2s steps(2, end) infinite",
      },
      keyframes: {
        "scan-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0.2" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0.2" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(34, 227, 220, 0.5)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(34, 227, 220, 0.55)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
      },
    },
  },
  plugins: [],
};
