/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vigil: {
          bg: "#0B0F19",
          card: "rgba(18, 24, 38, 0.75)",
          border: "rgba(255, 255, 255, 0.1)",
          accent: "#3B82F6",
          cyan: "#06B6D4",
          purple: "#8B5CF6",
          green: "#10B981",
          amber: "#F59E0B",
          red: "#EF4444"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar': 'radar 3s linear infinite'
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.6))' },
          '50%': { opacity: 0.6, filter: 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.2))' },
        },
        'radar': {
          '0%': { transform: 'scale(0.8)', opacity: 0.8 },
          '100%': { transform: 'scale(2.4)', opacity: 0 }
        }
      }
    },
  },
  plugins: [],
}
