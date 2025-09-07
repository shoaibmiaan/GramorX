import * as React from 'react'
import { Button } from '@/components/design-system/Button'

export type EmptyStateProps = { title: string; description?: string; icon?: React.ReactNode; actionLabel?: string; onAction?: () => void; actions?: React.ReactNode; className?: string; }

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, actionLabel, onAction, actions, className='' }) => {
  return (
    <div className={['border border-border bg-card text-card-foreground rounded-ds-2xl p-10 text-center mx-auto max-w-2xl', className].join(' ')}>
      {icon && <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-ds bg-muted text-foreground">{icon}</div>}
      <h2 className="font-slab text-h2 mb-2">{title}</h2>
      {description && <p className="text-body text-muted-foreground mb-6">{description}</p>}
      <div className="mt-2 flex items-center justify-center gap-3">
        {actionLabel && onAction && <Button variant="primary" onClick={onAction} className="rounded-ds-xl">{actionLabel}</Button>}
        {actions}
      </div>
    </div>
  )
}
export default EmptyState
