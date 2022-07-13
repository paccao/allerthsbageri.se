const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    screens: {
        xs: '475px',
        ...defaultTheme.screens,
    },
    theme: {
        extend: {},
    },
    plugins: [require('@tailwindcss/typography')],
}
