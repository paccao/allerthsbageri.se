import Image from 'next/image'
import { FC } from 'react'

import { SITE_NAME } from '../constants'

type HeroProps = {
    image: {
        src: string
        alt: string
    }
}

const Hero: FC<HeroProps> = ({ image }) => {
    return (
        <section className="grid h-screen grid-cols-2 place-items-center gap-4 p-4">
            <div className="prose prose-lg lg:prose-xl">
                <div className="flex flex-col items-center">
                    <p className="text-sm tracking-widest">Välkommen till</p>
                    <h1 className="font-display">{SITE_NAME}</h1>
                </div>
                <p>Hälsan framför allt!</p>
                <p>
                    Om den vägen så går genom örter & bakverk eller genom
                    musikens värld. Körsång på recept borde många människor
                    ordineras. Låt naturen och musiken vårda dej!{' '}
                </p>
            </div>
            <div className="overflow-none relative h-2/3 w-3/4 rounded-xl">
                <Image
                    src={image.src}
                    layout="fill"
                    alt={image.alt}
                    objectFit="contain"
                    className="rounded-xl"
                />
            </div>
        </section>
    )
}

export default Hero

