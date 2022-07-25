const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    screens: {
        xs: '475px',
        ...defaultTheme.screens,
    },
    theme: {
        extend: {
            fontFamily: {
                display: ['Italianno', 'cursive'],
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
}
