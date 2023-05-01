const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,ts,md,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Italianno', 'cursive'],
        serif: ['Quattrocento', 'serif'],
      },
    },
    screens: {
      '3xs': '300px',
      '2xs': '375px',
      xs: '475px',
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
