// components/design-system/Input.tsx
import React, { useId, useState, forwardRef, useImperativeHandle, useRef } from 'react'

const cx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ')

export type InputSize = 'sm' | 'md' | 'lg'
export type InputVariant = 'solid' | 'subtle' | 'ghost' | 'underline'
export type InputState = 'none' | 'success' | 'warning' | 'danger'

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string
  /** Enable nice float label (works with placeholder=" ") */
  floatLabel?: boolean
  hint?: string
  error?: string
  state?: InputState
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  size?: InputSize
  variant?: InputVariant
  rounded?: 'ds' | 'ds-xl' | 'ds-2xl' | 'lg' | 'xl' | '2xl'
  addonLeft?: React.ReactNode
  addonRight?: React.ReactNode
  clearable?: boolean
  onClear?: () => void
  passwordToggle?: boolean
  loading?: boolean
  showCounter?: boolean
  requiredMark?: boolean
}

const sizeMap: Record<InputSize, { h: string; text: string; padX: string; icon: string; addon: string; label: string }> = {
  sm: { h: 'h-9',  text: 'text-sm',  padX: 'px-3', icon: 'h-4 w-4', addon: 'px-2 text-xs', label: 'text-xs' },
  md: { h: 'h-10', text: 'text-[0.95rem]', padX: 'px-4', icon: 'h-5 w-5', addon: 'px-3 text-sm', label: 'text-small' },
  lg: { h: 'h-12', text: 'text-base', padX: 'px-4', icon: 'h-5 w-5', addon: 'px-4', label: 'text-sm' },
}

const roundedMap = {
  ds: 'rounded-ds',
  'ds-xl': 'rounded-ds-xl',
  'ds-2xl': 'rounded-ds-2xl',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
} as const

const roundedLeft = {
  ds: 'rounded-l-ds',
  'ds-xl': 'rounded-l-ds-xl',
  'ds-2xl': 'rounded-l-ds-2xl',
  lg: 'rounded-l-lg',
  xl: 'rounded-l-xl',
  '2xl': 'rounded-l-2xl',
} as const

const roundedRight = {
  ds: 'rounded-r-ds',
  'ds-xl': 'rounded-r-ds-xl',
  'ds-2xl': 'rounded-r-ds-2xl',
  lg: 'rounded-r-lg',
  xl: 'rounded-r-xl',
  '2xl': 'rounded-r-2xl',
} as const

const variantBase: Record<InputVariant, string> = {
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

const stateCls: Record<Exclude<InputState, 'none'>, string> = {
  success: 'border-success focus-visible:border-success focus-visible:ring-success/30',
  warning: 'border-goldenYellow focus-visible:border-goldenYellow focus-visible:ring-goldenYellow/30',
  danger:  'border-sunsetRed focus-visible:border-sunsetRed focus-visible:ring-sunsetRed/30',
}

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <span
    role="status"
    aria-hidden="true"
    className={cx('inline-block animate-spin rounded-full border-2 border-foreground/40 border-t-foreground h-4 w-4', className)}
  />
)

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    floatLabel,
    hint,
    error,
    state = 'none',
    iconLeft,
    iconRight,
    addonLeft,
    addonRight,
    className = '',
    id,
    size = 'md',
    variant = 'subtle',
    rounded = 'ds',
    clearable,
    onClear,
    passwordToggle,
    loading,
    showCounter,
    requiredMark,
    type = 'text',
    value,
    defaultValue,
    maxLength,
    disabled,
    readOnly,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const inputId = id || generatedId

  const isPasswordToggle = type === 'password' && passwordToggle
  const [reveal, setReveal] = useState(false)

  const [uncontrolledVal, setUncontrolledVal] = useState<string | number | readonly string | undefined>(defaultValue)
  const controlled = value !== undefined

  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

  const describedIds: string[] = []
  if (hint) describedIds.push(`${inputId}-hint`)
  if (error) describedIds.push(`${inputId}-error`)
  const describedBy = describedIds.length ? describedIds.join(' ') : undefined

  const sz = sizeMap[size]

  const baseField = cx(
    'w-full transition-all duration-200 placeholder-mutedText',
    'appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
    variantBase[variant],
    variant !== 'underline' ? roundedMap[rounded] : '',
    sz.h,
    sz.text,
    sz.padX
  )

  const tone =
    error ? stateCls.danger :
    state !== 'none' ? stateCls[state] :
    ''

  const hasLeft = Boolean(iconLeft || addonLeft)
  const hasRight = Boolean(iconRight || clearable || isPasswordToggle || loading || addonRight)
  const leftPad = iconLeft ? 'pl-10' : addonLeft ? 'pl-0' : ''
  const rightPad = hasRight ? 'pr-10' : ''
  const fieldCls = cx(baseField, tone, leftPad, rightPad, disabled && 'opacity-70 cursor-not-allowed', readOnly && 'opacity-90')

  const onClearClick = () => {
    if (controlled) {
      onClear?.()
      if (inputRef.current) {
        inputRef.current.value = ''
        inputRef.current.dispatchEvent(new Event('input', { bubbles: true }))
      }
    } else {
      setUncontrolledVal('')
      onClear?.()
    }
    inputRef.current?.focus()
  }

  const currVal = (controlled ? value : uncontrolledVal) ?? ''
  const length = typeof currVal === 'string' ? currVal.length : String(currVal).length

  return (
    <label htmlFor={inputId} className="block">
      {/* Static label (non-floating) */}
      {!floatLabel && label && (
        <span className={cx('mb-1.5 inline-block text-small text-mutedText', sz.label)}>
          {label}
          {requiredMark && <span className="ml-1 text-sunsetRed">*</span>}
        </span>
      )}

      <div className={cx('relative flex items-stretch', error && 'text-sunsetRed')}>
        {/* Left addon */}
        {addonLeft && variant !== 'underline' && (
          <span
            className={cx(
              'inline-flex items-center border border-border bg-background text-mutedText',
              roundedLeft[rounded],
              'rounded-r-none',
              sz.addon
            )}
          >
            {addonLeft}
          </span>
        )}

        {/* Left icon */}
        {iconLeft && (
          <span className={cx(
            'pointer-events-none absolute inset-y-0 left-3 inline-flex items-center opacity-70',
            error ? 'text-sunsetRed' : 'text-mutedText'
          )}>
            {iconLeft}
          </span>
        )}

        {/* Floating label */}
        {floatLabel && label && variant !== 'underline' && (
          <span
            className={cx(
              'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2',
              'text-mutedText transition-all duration-150',
              // peer hooks
              'peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-small',
              'peer-focus:-top-2 peer-focus:text-[0.75rem] peer-focus:text-foreground',
              // when has value (controlled or uncontrolled)
              (currVal ? '-top-2 text-[0.75rem] text-foreground' : '')
            )}
          >
            {label}{requiredMark && <span className="ml-1 text-sunsetRed">*</span>}
          </span>
        )}

        {/* Input */}
        <input
          id={inputId}
          ref={inputRef}
          {...props}
          type={isPasswordToggle ? (reveal ? 'text' : 'password') : type}
          className={cx(
            fieldCls,
            addonLeft && variant !== 'underline' && 'rounded-l-none',
            addonRight && variant !== 'underline' && 'rounded-r-none',
            floatLabel && 'peer placeholder-transparent'
          )}
          aria-describedby={describedBy}
          aria-invalid={!!error || (state === 'danger') || undefined}
          disabled={disabled}
          readOnly={readOnly}
          value={controlled ? value : uncontrolledVal}
          onChange={(e) => {
            if (!controlled) setUncontrolledVal(e.target.value)
            props.onChange?.(e)
          }}
          placeholder={floatLabel ? ' ' : props.placeholder}
          maxLength={maxLength}
        />

        {/* Right cluster */}
        <div className="absolute inset-y-0 right-2 flex items-center gap-2">
          {loading && <Spinner />}
          {iconRight && <span className="pointer-events-none inline-flex items-center text-mutedText opacity-70">{iconRight}</span>}

          {isPasswordToggle && (
            <button
              type="button"
              className="inline-flex items-center px-2 text-xs text-mutedText hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-ds"
              onClick={() => setReveal((v) => !v)}
              aria-label={reveal ? 'Hide password' : 'Show password'}
            >
              {reveal ? 'Hide' : 'Show'}
            </button>
          )}

          {clearable && !loading && !isPasswordToggle && length > 0 && (
            <button
              type="button"
              onClick={onClearClick}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-mutedText hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Clear input"
            >
              ×
            </button>
          )}
        </div>

        {/* Right addon */}
        {addonRight && variant !== 'underline' && (
          <span
            className={cx(
              'inline-flex items-center border border-border bg-background text-mutedText',
              roundedRight[rounded],
              'rounded-l-none',
              sz.addon
            )}
          >
            {addonRight}
          </span>
        )}
      </div>

      {/* Helper row */}
      <div className="mt-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {error ? (
            <span id={`${inputId}-error`} role="alert" aria-live="polite" className="block text-small text-sunsetRed">
              {error}
            </span>
          ) : hint ? (
            <span id={`${inputId}-hint`} className="block text-small text-mutedText">
              {hint}
            </span>
          ) : null}
        </div>
        {showCounter && typeof maxLength === 'number' && (
          <span className="text-small text-mutedText">{length} / {maxLength}</span>
        )}
      </div>
    </label>
  )
})
