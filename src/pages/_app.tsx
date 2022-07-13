import { FC, forwardRef } from 'react'
import type { AppProps } from 'next/app'
import { MDXProvider } from '@mdx-js/react'
import { MDXComponents } from 'mdx/types'
import Image, { ImageProps } from 'next/image'
import Link from 'next/link'

import '../styles/globals.css'

const ResponsiveImage: FC<ImageProps> = (props) => (
    <Image {...props} layout="responsive" alt={props.alt} />
)

const CustomLink: typeof Link = forwardRef(function CustomLink(
    { children, ...props },
    ref,
) {
    return (
        <Link {...props}>
            <a className="underline text-black bg-red-500" ref={ref}>
                {children}
            </a>
        </Link>
    )
})

const components = {
    image: ResponsiveImage,
    a: CustomLink,
    p: (props: any) => <p {...props} className="bg-red-200" />,
} as unknown as MDXComponents

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <MDXProvider components={components}>
            <Component {...pageProps} />
        </MDXProvider>
    )
}

export default MyApp
