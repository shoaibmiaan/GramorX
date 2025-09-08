// components/design-system/Alert.tsx
import * as React from 'react'

const cx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ')

type Variant = 'info' | 'success' | 'warning' | 'error'
type Appearance = 'soft' | 'solid' | 'outline'

export const Alert: React.FC<{
  title?: string
  children?: React.ReactNode
  variant?: Variant
  appearance?: Appearance
  icon?: React.ReactNode
  dismissible?: boolean
  onClose?: () => void
  actions?: React.ReactNode
  compact?: boolean
  elevated?: boolean
  className?: string
}> = ({
  title,
  children,
  variant = 'info',
  appearance = 'soft',
  icon,
  dismissible = false,
  onClose,
  actions,
  compact = false,
  elevated = false,
  className = '',
  ...rest
}) => {
  const IconInfo = (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm.75 6.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM11 10h2v7h-2z"/>
    </svg>
  )
  const IconCheck = (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2m-1.1 13.7-3.6-3.6 1.4-1.4 2.2 2.2 4.7-4.7 1.4 1.4z"/>
    </svg>
  )
  const IconWarn = (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M1 21h22L12 2 1 21Zm12-3h-2v2h2v-2Zm0-8h-2v6h2v-6Z"/>
    </svg>
  )
  const IconError = (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm3.5 12.09-1.41 1.41L12 13.41l-2.09 2.09-1.41-1.41L10.59 12 8.5 9.91l1.41-1.41L12 10.59l2.09-2.09 1.41 1.41L13.41 12z"/>
    </svg>
  )
  const IconClose = (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6z"/>
    </svg>
  )

  const tone: Record<Variant, Record<Appearance, string>> = {
    info: {
      soft: 'bg-electricBlue/10 text-electricBlue border-electricBlue/30',
      solid: 'bg-electricBlue text-foreground border-electricBlue',
      outline: 'bg-transparent text-electricBlue border-electricBlue',
    },
    success: {
      soft: 'bg-success/10 text-success border-success/30',
      solid: 'bg-success text-foreground border-success',
      outline: 'bg-transparent text-success border-success',
    },
    warning: {
      soft: 'bg-goldenYellow/10 text-goldenYellow border-goldenYellow/30',
      solid: 'bg-goldenYellow text-dark border-goldenYellow',
      outline: 'bg-transparent text-goldenYellow border-goldenYellow',
    },
    error: {
      soft: 'bg-sunsetRed/10 text-sunsetRed border-sunsetRed/30',
      solid: 'bg-sunsetRed text-foreground border-sunsetRed',
      outline: 'bg-transparent text-sunsetRed border-sunsetRed',
    },
  }

  const urgent = variant === 'warning' || variant === 'error'
  const role = urgent ? 'alert' : 'status'
  const live = urgent ? 'assertive' : 'polite'

  const padding = compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'
  const gap = compact ? 'gap-2.5' : 'gap-3'
  const titleMb = compact ? 'mb-0.5' : 'mb-1'

  const defaultIcon =
    variant === 'success' ? <IconCheck className="h-5 w-5 sm:h-6 sm:w-6" /> :
    variant === 'warning' ? <IconWarn className="h-5 w-5 sm:h-6 sm:w-6" /> :
    variant === 'error'   ? <IconError className="h-5 w-5 sm:h-6 sm:w-6" /> :
                            <IconInfo className="h-5 w-5 sm:h-6 sm:w-6" />

  return (
    <div
      role={role}
      aria-live={live}
      aria-atomic="true"
      className={cx(
        'border rounded-ds-2xl bg-card text-card-foreground', // base semantic surface
        tone[variant][appearance],
        padding,
        elevated && 'shadow-glow',
        className
      )}
      {...rest}
    >
      <div className={cx('flex items-start', gap)}>
        <div className="shrink-0 pt-0.5">{icon ?? defaultIcon}</div>

        <div className="min-w-0 flex-1">
          {title && <div className={cx('font-semibold', titleMb)}>{title}</div>}
          {children && <div className="text-foreground/90">{children}</div>}
          {actions && (
            <div className={cx('flex flex-wrap items-center gap-2', compact ? 'mt-2' : 'mt-3')}>
              {actions}
            </div>
          )}
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={onClose}
            className={cx(
              'ml-2 inline-flex items-center justify-center rounded-full p-1.5',
              'hover:bg-foreground/10',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
            )}
            aria-label="Dismiss notification"
          >
            <IconClose className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}

export default Alert
