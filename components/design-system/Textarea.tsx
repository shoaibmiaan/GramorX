// components/design-system/Textarea.tsx
import * as React from 'react'

const cx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ')

export type TextareaSize = 'sm' | 'md' | 'lg'
export type TextareaVariant = 'solid' | 'subtle' | 'ghost' | 'underline'
export type TextareaState = 'none' | 'success' | 'warning' | 'danger'
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  hint?: string
  error?: string
  state?: TextareaState
  size?: TextareaSize
  variant?: TextareaVariant
  rounded?: 'ds' | 'ds-xl' | 'ds-2xl' | 'lg' | 'xl' | '2xl'
  resize?: TextareaResize
  autoGrow?: boolean
  showCounter?: boolean
}

const roundedMap = {
  ds: 'rounded-ds',
  'ds-xl': 'rounded-ds-xl',
  'ds-2xl': 'rounded-ds-2xl',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
} as const

const sizeMap: Record<TextareaSize, string> = {
  sm: 'text-sm p-3',
  md: 'text-[0.95rem] p-4',
  lg: 'text-base p-5',
}

const resizeMap: Record<TextareaResize, string> = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
}

const variantBase: Record<TextareaVariant, string> = {
  solid: cx(
    'bg-card text-card-foreground border border-border',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
  ),
  subtle: cx(
    'bg-background text-foreground border border-border',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
  ),
  ghost: cx(
    'bg-transparent text-foreground border border-transparent',
    'hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
  ),
  underline: cx(
    'bg-transparent text-foreground border-0 border-b border-border rounded-none',
    'focus-visible:outline-none focus-visible:ring-0 focus-visible:border-b-primary'
  ),
}

const stateCls: Record<Exclude<TextareaState, 'none'>, string> = {
  success: 'border-success focus-visible:border-success focus-visible:ring-success/30',
  warning: 'border-goldenYellow focus-visible:border-goldenYellow focus-visible:ring-goldenYellow/30',
  danger:  'border-sunsetRed focus-visible:border-sunsetRed focus-visible:ring-sunsetRed/30',
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  hint,
  error,
  state = 'none',
  className = '',
  size = 'md',
  variant = 'subtle',
  rounded = 'ds',
  resize = 'vertical',
  autoGrow = false,
  showCounter = false,
  maxLength,
  value,
  defaultValue,
  onChange,
  ...props
}) => {
  const [uncontrolled, setUncontrolled] = React.useState<string | number | readonly string | undefined>(defaultValue)
  const controlled = value !== undefined
  const curr = (controlled ? value : uncontrolled) ?? ''
  const count = typeof curr === 'string' ? curr.length : String(curr).length

  const ref = React.useRef<HTMLTextAreaElement>(null)
  React.useEffect(() => {
    if (!autoGrow || !ref.current) return
    const el = ref.current
    // reset height to let it shrink too
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [curr, autoGrow])

  const base =
    'w-full placeholder-mutedText transition-all duration-200 ' +
    'appearance-none'

  const tone =
    error ? stateCls.danger :
    state !== 'none' ? stateCls[state] :
    ''

  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 inline-block text-small text-mutedText">{label}</span>}

      <textarea
        ref={ref}
        className={cx(
          base,
          variantBase[variant],
          variant !== 'underline' ? roundedMap[rounded] : '',
          sizeMap[size],
          resizeMap[resize],
          tone
        )}
        value={controlled ? value : uncontrolled}
        onChange={(e) => {
          if (!controlled) setUncontrolled(e.target.value)
          onChange?.(e)
        }}
        maxLength={maxLength}
        {...props}
      />

      <div className="mt-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {error ? (
            <span className="block text-small text-sunsetRed" role="alert" aria-live="polite">
              {error}
            </span>
          ) : hint ? (
            <span className="block text-small text-mutedText">{hint}</span>
          ) : null}
        </div>
        {showCounter && typeof maxLength === 'number' && (
          <span className="text-small text-mutedText">{count} / {maxLength}</span>
        )}
      </div>
    </label>
  )
}

export default Textarea
