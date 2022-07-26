import Image from 'next/image'
import { FC } from 'react'

import { SITE_NAME } from '../constants'

type HeroProps = {}

const images = [
    {
        src: '/images/herbs.jpg',
        alt: 'Örter på ett porslinfat',
        width: 300,
        height: 300,
    },
    {
        src: '/images/image009.jpg',
        alt: 'Goda bakverk med örter',
        width: 300,
        height: 300,
    },
    {
        src: '/images/textiles-and-plant.jpg',
        alt: 'Vita textilier och en liten trevlig kvist med blad.',
        width: 300,
        height: 300,
    },
    {
        src: '/images/herb-bowl.jpg',
        alt: 'Skål fylld med örter',
        width: 300,
        height: 300,
    },
]

const Hero: FC<HeroProps> = () => {
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

            <div className="grid grid-cols-2 gap-4">
                {images.map(({ src, alt, width, height }) => (
                    <div
                        className="relative overflow-hidden rounded-xl shadow-md"
                        style={{ height, width }}
                        key={src}
                    >
                        <Image
                            src={src}
                            layout="intrinsic"
                            alt={alt}
                            className="transform rounded-xl transition-transform duration-300 hover:scale-105"
                            width={width}
                            height={height}
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Hero

