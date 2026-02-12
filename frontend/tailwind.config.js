
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          bg: '#050505',
          panel: '#0a0a0a',
          border: '#1f1f1f',
          green: '#00ff41',
          greenDim: 'rgba(0, 255, 65, 0.1)',
          red: '#ff003c',
          blue: '#0ea5e9',
          text: '#e2e8f0',
          muted: '#64748b'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace', 'ui-monospace', 'SFMono-Regular']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        }
      }
    },
  },
  plugins: [],
}
