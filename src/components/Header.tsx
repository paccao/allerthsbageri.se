import Link from 'next/link'
import { FC } from 'react'
import { SITE_NAME } from '../constants'

export type HeaderProps = {}

const Header: FC<HeaderProps> = ({}) => {
    return (
        <header>
            <nav>
                <Link href="/">
                    <a className="bg-teal-400">{SITE_NAME}</a>
                </Link>
            </nav>
        </header>
    )
}

export default Header

