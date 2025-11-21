/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #3B82F6)',
          hover: 'var(--color-primary-hover, #2563EB)',
        },
      },
    },
  },
  plugins: [],
}
