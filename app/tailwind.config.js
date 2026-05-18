/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A',
          hover: '#1D4ED8',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F3F4F6',
          foreground: '#1F2937',
        },
        background: {
          DEFAULT: '#1E3A8A',
          panel: '#FAFAF9',
          terminal: '#0D1117',
        },
        foreground: {
          DEFAULT: '#1F2937',
          muted: '#6B7280',
          blueprint_line: '#60A5FA',
          terminal_text: '#10B981',
        },
        border: {
          DEFAULT: '#E5E7EB',
          blueprint: '#3B82F6',
        },
        destructive: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
      },
    },
  },
  plugins: [],
}
