import Link from 'next/link'
import { useRouter } from 'next/router'
import * as React from 'react'

type Props = { href: string; children?: React.ReactNode; label?: string; exact?: boolean; className?: string; variant?: 'pill'|'plain'; }

export const NavLink: React.FC<Props> = ({ href, children, label, exact=false, className='', variant='pill' }) => {
  const { pathname, asPath } = useRouter(); const current = asPath || pathname
  const isActive = exact ? current === href : current.startsWith(href)
  const base = variant==='pill' ? 'nav-pill' : 'inline-flex items-center'
  const active = isActive ? 'is-active' : ''
  return (
    <Link href={href} aria-current={isActive ? 'page' : undefined}
      className={[base, active, 'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background', className].join(' ')}>
      {children ?? label}
    </Link>
  )
}
export default NavLink
