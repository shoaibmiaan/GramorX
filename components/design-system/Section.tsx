// components/design-system/Section.tsx
import * as React from 'react'
import { Container as DSContainer } from './Container'

export type SectionProps = React.HTMLAttributes<HTMLElement> & {
  Container?: boolean
  containerClassName?: string
  tone?: 'default' | 'dark'
  divider?: 'top' | 'bottom' | 'both'
  children?: React.ReactNode
}

export const Section: React.FC<SectionProps> = ({
  id,
  className = '',
  Container = false,
  containerClassName = '',
  tone = 'default',
  divider,
  children,
  ...rest
}) => {
  const base = 'py-24'
  const toneCls = tone === 'dark' ? 'section-dark' : 'bg-background text-foreground'
  const dividerCls =
    divider === 'top' ? 'border-t border-border' :
    divider === 'bottom' ? 'border-b border-border' :
    divider === 'both' ? 'border-y border-border' : ''
  const content = Container ? <DSContainer className={containerClassName}>{children}</DSContainer> : children

  return (
    <section id={id} className={`${base} ${toneCls} ${dividerCls} ${className}`} {...rest}>
      {content}
    </section>
  )
}

export default Section
