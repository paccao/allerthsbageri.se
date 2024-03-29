const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,ts,md,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Italianno', 'sans-serif'],
        serif: ['Quattrocento', 'serif'],
      },
    },
    screens: {
      '3xs': '300px',
      '2xs': '375px',
      '1xs': '384px',
      xs: '475px',
      ...defaultTheme.screens,
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
