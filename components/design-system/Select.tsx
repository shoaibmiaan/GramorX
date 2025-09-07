// components/design-system/Select.tsx
import * as React from 'react'
import { ChevronDownIcon } from '@/lib/icons'

type Option = { value: string; label: string; disabled?: boolean }
export type SelectSize = 'sm' | 'md' | 'lg'

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  hint?: string
  error?: string
  options?: Option[]
  size?: SelectSize
}

const sizeMap: Record<SelectSize, string> = {
  sm: 'h-9 text-sm',
  md: 'h-10',
  lg: 'h-12 text-base',
}

export const Select: React.FC<SelectProps> = ({
  label, hint, error, options = [], size = 'md', className = '', children, disabled, ...props
}) => {
  const base =
    'w-full rounded-ds border border-border bg-card text-card-foreground ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
    'pl-4 pr-10'
  const invalid = error ? 'border-sunsetRed focus-visible:ring-sunsetRed/30' : ''
  const disabledCls = disabled ? 'opacity-70 cursor-not-allowed' : ''

  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 inline-block text-small text-mutedText">{label}</span>}
      <div className="relative">
        <select className={`${base} ${invalid} ${disabledCls} ${sizeMap[size]}`} disabled={disabled} {...props}>
          {options.map(opt => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
          ))}
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-70">
          <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      {error ? (
        <span className="mt-1 block text-small text-sunsetRed" role="alert" aria-live="polite">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-small text-mutedText">{hint}</span>
      ) : null}
    </label>
  )
}
