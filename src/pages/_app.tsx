import { FC } from 'react'
import type { AppProps } from 'next/app'
import { MDXProvider } from '@mdx-js/react'
import { MDXComponents } from 'mdx/types'
import Image, { ImageProps } from 'next/image'

import '../styles/globals.css'

const ResponsiveImage: FC<ImageProps> = (props) => (
    <Image {...props} layout="responsive" alt={props.alt} />
)

const components = {
    image: ResponsiveImage,
} as MDXComponents

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <MDXProvider components={components}>
            <Component {...pageProps} />
        </MDXProvider>
    )
}

export default MyApp
