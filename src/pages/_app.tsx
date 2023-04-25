import { FC, forwardRef } from 'react'
import type { AppProps } from 'next/app'
import { MDXProvider } from '@mdx-js/react'
import { MDXComponents } from 'mdx/types'
import Image, { ImageProps } from 'next/image'
import Link from 'next/link'

import '../styles/fonts.css'
import '../styles/globals.css'

const ResponsiveImage: FC<ImageProps> = (props) => (
    <Image {...props} layout="responsive" alt={props.alt} />
)

const CustomLink: typeof Link = forwardRef(function CustomLink(
    { children, ...props },
    ref,
) {
    return (
        (<Link {...props} className="underline" ref={ref}>

            {children}

        </Link>)
    );
})

const components = {
    image: ResponsiveImage,
    a: CustomLink,
} as unknown as MDXComponents

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <MDXProvider components={components}>
            <Component {...pageProps} />
        </MDXProvider>
    )
}

export default MyApp
