import { FC, ReactNode } from 'react'
import Head from 'next/head'

import { SITE_DESCRIPTION, SITE_NAME } from '../constants'

export type PostLayoutProps = {
    children: ReactNode
}

const PostLayout: FC<PostLayoutProps> = ({ children }) => {
    return (
        <main>
            {/* IDEA: Use specific meta tags based on post content */}
            <Head>
                <title>{SITE_NAME}</title>
                <meta name="description" content={SITE_DESCRIPTION} />
            </Head>

            {children}
        </main>
    )
}

export default PostLayout

