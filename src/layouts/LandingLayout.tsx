import { FC, ReactNode } from 'react'
import Head from 'next/head'

import { SITE_DESCRIPTION, SITE_NAME } from '../constants'
import Header from '../components/Header'
import Hero from '../components/Hero'

export type LandingLayoutProps = {
    children: ReactNode
}

const heroImage = {
    src: '/../public/images/textiles-and-plant.jpg',
    alt: 'En bild på vita textilier och en liten trevlig kvist med blad.',
}

const LandingLayout: FC<LandingLayoutProps> = ({ children }) => {
    return (
        <>
            <Head>
                <title>{SITE_NAME}</title>
                <meta name="description" content={SITE_DESCRIPTION} />
            </Head>
            <Header />
            <main>
                <Hero image={heroImage} />

                <article className='lg:prose-xl"> prose prose-stone mx-auto marker:text-stone-900 prose-p:leading-6 prose-p:text-stone-900 prose-strong:text-stone-900 prose-em:text-stone-900 prose-li:my-1 prose-li:text-stone-900 md:prose-lg'>
                    {children}
                </article>
            </main>
        </>
    )
}

export default LandingLayout

