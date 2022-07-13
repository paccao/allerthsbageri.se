import { FC, ReactNode } from 'react'
import Head from 'next/head'

import { SITE_DESCRIPTION, SITE_NAME } from '../constants'

export type LandingLayoutProps = {
    children: ReactNode
}

const LandingLayout: FC<LandingLayoutProps> = ({ children }) => {
    return (
        <main className="bg-green-400">
            <Head>
                <title>{SITE_NAME}</title>
                <meta name="description" content={SITE_DESCRIPTION} />
            </Head>

            {children}
        </main>
    )
}

export default LandingLayout

