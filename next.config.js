const nextMDX = require('@next/mdx')

const withMDX = nextMDX({
    extension: /\.mdx?$/,
    options: {
        providerImportSource: '@mdx-js/react',
    },
})

module.exports = withMDX({
    pageExtensions: ['mdx', 'tsx', 'ts', 'jsx', 'js'],
    reactStrictMode: true,
})
