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

            <div className="w-screen h-screen flex flex-col justify-center items-center p-4">
                {SITE_NAME}
            </div>
        </>
    )
}

export default Home
