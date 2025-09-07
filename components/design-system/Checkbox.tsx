import * as React from 'react'
const cx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ')

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string; hint?: string; error?: string; size?: 'sm' | 'md' | 'lg'; indeterminate?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label, hint, error, className = '', size = 'md', indeterminate, id, ...props
}) => {
  const inputId = React.useId(); const finalId = id || inputId; const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate }, [indeterminate])
  const boxSize = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' }[size]

  return (
    <label htmlFor={finalId} className={cx('flex items-start gap-3', className)}>
      <input id={finalId} ref={ref} type="checkbox" className="sr-only peer" aria-invalid={!!error || undefined} {...props}/>
      <span className={cx(
        'mt-0.5 grid place-content-center rounded-ds border transition',
        'bg-card text-card-foreground border-border',
        'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
        'peer-checked:bg-primary peer-checked:border-primary peer-checked:text-background',
        error && 'border-sunsetRed'
      )} aria-hidden="true">
        <span className={cx(boxSize,'relative')}>
          <svg viewBox="0 0 24 24" className={cx('absolute inset-0 m-auto h-4 w-4 transition', indeterminate ? 'opacity-0 scale-75' : 'opacity-0 scale-75 peer-checked:opacity-100 peer-checked:scale-100')}>
            <path fill="currentColor" d="M9 16.2 5.5 12.7 4.1 14.1 9 19l11.3-11.3-1.4-1.4z"/>
          </svg>
          <svg viewBox="0 0 24 24" className={cx('absolute inset-0 m-auto h-4 w-4 transition', indeterminate ? 'opacity-100 scale-100' : 'opacity-0 scale-75')}>
            <rect x="5" y="11" width="14" height="2" rx="1" fill="currentColor"/>
          </svg>
        </span>
      </span>
      <div className="min-w-0">
        {label && <div className="text-body text-foreground">{label}</div>}
        {error ? <div className="text-small text-sunsetRed" role="alert" aria-live="polite">{error}</div>
               : hint ? <div className="text-small text-muted-foreground">{hint}</div> : null}
      </div>
    </label>
  )
}
export default Checkbox
