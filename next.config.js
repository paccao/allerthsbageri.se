const nextMDX = require('@next/mdx')

const withMDX = nextMDX({
    // By default only the .mdx extension is supported.
    extension: /\.mdx?$/,
})

module.exports = withMDX({
    // Support MDX files as pages:
    pageExtensions: ['mdx', 'tsx', 'ts', 'jsx', 'js'],
    reactStrictMode: true,
})
