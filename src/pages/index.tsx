import type { NextPage } from 'next'
import Head from 'next/head'

import { SITE_NAME } from '../constants'

const Home: NextPage = () => {
    return (
        <>
            <Head>
                <title>{SITE_NAME}</title>
                <meta name="description" content="En hemsida för bagare" />
            </Head>

            <main className="text-center">
                <h1 className="py-8 text-">{SITE_NAME}</h1>
                <a href="/test">go to test page</a>
            </main>
        </>
    )
}

export default Home
