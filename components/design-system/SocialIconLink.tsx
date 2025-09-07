// components/design-system/SocialIconLink.tsx
import * as React from 'react'

const cx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ')

type Size = 'sm' | 'md' | 'lg'
type Tone = 'brand' | 'neutral' | 'primary' | 'accent'

export const SocialIconLink: React.FC<{
  href: string
  /** Either a FA brand key (e.g. 'facebook-f') or a React node (icon component). */
  icon: string | React.ReactNode
  label: string
  className?: string
  size?: Size
  tone?: Tone
  newTab?: boolean // force open in new tab
}> = ({ href, icon, label, className = '', size = 'md', tone = 'brand', newTab }) => {
  const sz = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10', lg: 'w-12 h-12 text-lg' }[size]
  const toneCls =
    tone === 'neutral'
      ? 'bg-muted text-foreground/80 hover:text-foreground'
      : tone === 'primary'
      ? 'bg-primary/10 text-primary'
      : tone === 'accent'
      ? 'bg-accent/10 text-accent'
      : 'bg-primary/10 text-primary dark:bg-purpleVibe/10 dark:text-neonGreen' // brand (default)

  const isExternal = newTab ?? /^(https?:)?\/\//.test(href)
  const iconNode =
    typeof icon === 'string'
      ? <i className={`fab fa-${icon}`} aria-hidden="true" /> // FA fallback if you still load it
      : <span aria-hidden="true" className="grid place-items-center">{icon}</span>

  return (
    <a
      href={href}
      aria-label={label}
      className={cx(
        'rounded-full inline-flex items-center justify-center',
        'transition will-change-transform hover:-translate-y-0.5',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        sz,
        toneCls,
        className
      )}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      title={label}
    >
      {iconNode}
    </a>
  )
}

export default SocialIconLink
