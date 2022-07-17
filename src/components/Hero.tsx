import Link from 'next/link'
import Image from 'next/image'
import { FC } from 'react'

type HeroProps = {
    imagePath: string
    imageAlt: string
    imageWidth: number
}

const Hero: FC<HeroProps> = (props) => {
    return (
        <section className="flex h-screen w-full items-center justify-evenly p-4">
            <article className="prose h-2/3 flex-1 p-20 lg:prose-xl">
                <h1>Allerths örtbageri</h1>
                <p>Hälsan framför allt!</p>
                <p>
                    Om den vägen så går genom örter & bakverk eller genom
                    musikens värld. Körsång på recept borde många människor
                    ordineras. Låt naturen och musiken vårda dej!{' '}
                </p>
            </article>
            <div className="relative h-5/6 w-5/12">
                <Image
                    src={props.imagePath}
                    layout="fill"
                    alt={props.imageAlt}
                    objectFit="contain"
                    className="rounded-xl"
                />
            </div>
        </section>
    )
}

export default Hero
