/** @type {import('tailwindcss').Config} */
export default {
  // Dark mode via class (e.g. <html class="dark">)
  darkMode: ["class"],
  // Source scanning — tells Tailwind where to look for class names
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  // All design tokens now live in @theme in index.css.
  // This config is kept minimal — only overrides that @theme cannot express.
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
