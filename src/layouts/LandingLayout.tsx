import { FC, ReactNode } from 'react'
import Head from 'next/head'

import { SITE_DESCRIPTION, SITE_NAME } from '../constants'
import Header from '../components/Header'

export type LandingLayoutProps = {
    children: ReactNode
}

const LandingLayout: FC<LandingLayoutProps> = ({ children }) => {
    return (
        <main>
            <Head>
                <title>{SITE_NAME}</title>
                <meta name="description" content={SITE_DESCRIPTION} />
            </Head>

            <Header />

            <article className='lg:prose-xl"> prose prose-stone mx-auto marker:text-stone-900 prose-p:leading-6 prose-p:text-stone-900 prose-strong:text-stone-900 prose-em:text-stone-900 prose-li:my-1 prose-li:text-stone-900 md:prose-lg'>
                {children}
            </article>
        </main>
    )
}

export default LandingLayout

