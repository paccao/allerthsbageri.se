const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,ts,md,mdx}'],
  screens: {
    '2xs': '375px',
    xs: '475px',
    ...defaultTheme.screens,
  },
  theme: {
    extend: {
      fontFamily: {
        display: ['Italianno', 'cursive'],
        sans: ['Quattrocento', 'serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
