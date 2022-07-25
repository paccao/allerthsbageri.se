import Link from 'next/link'
import { FC } from 'react'
import { SITE_NAME } from '../constants'

export type HeaderProps = {}

const Header: FC<HeaderProps> = ({}) => {
    return (
        <header className="flex w-full items-center justify-center p-4">
            <nav>
                <Link href="/">
                    <a className="font-display text-2xl">{SITE_NAME}</a>
                </Link>
            </nav>
        </header>
    )
}

export default Header

