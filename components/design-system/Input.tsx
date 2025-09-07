// components/design-system/Input.tsx
import React, { useId, useState, forwardRef, useImperativeHandle, useRef } from 'react';

/** tiny class combiner */
const cx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ');

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'solid' | 'subtle' | 'ghost' | 'underline';
export type InputState = 'none' | 'success' | 'warning' | 'danger';

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  hint?: string;
  error?: string;                // shows below field; sets aria-invalid + tone=danger
  state?: InputState;            // visual tone without error text (success/warning/danger)
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  size?: InputSize;
  variant?: InputVariant;
  rounded?: 'ds' | 'ds-xl' | 'ds-2xl' | 'lg' | 'xl' | '2xl';
  addonLeft?: React.ReactNode;
  addonRight?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  passwordToggle?: boolean;      // works when type="password"
  loading?: boolean;
  showCounter?: boolean;
  requiredMark?: boolean;
};

const sizeMap: Record<InputSize, { input: string; icon: string; addon: string; label: string }> = {
  sm: { input: 'h-9 text-sm',      icon: 'h-4 w-4', addon: 'px-2 text-xs', label: 'text-xs' },
  md: { input: 'h-10',             icon: 'h-5 w-5', addon: 'px-3 text-sm', label: 'text-small' },
  lg: { input: 'h-12 text-base',   icon: 'h-5 w-5', addon: 'px-4',         label: 'text-sm' },
};

const roundedMap: Record<NonNullable<InputProps['rounded']>, string> = {
  ds: 'rounded-ds',
  'ds-xl': 'rounded-ds-xl',
  'ds-2xl': 'rounded-ds-2xl',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

const variantBase: Record<InputVariant, string> = {
  solid: cx(
    'bg-card text-card-foreground border border-border',
    'focus:bg-card focus:border-primary focus:ring-2 focus:ring-border'
  ),
  subtle: cx(
    'bg-background text-foreground border border-border',
    'focus:border-primary focus:ring-2 focus:ring-border'
  ),
  ghost: cx(
    'bg-transparent text-foreground border border-transparent',
    'hover:border-border focus:border-primary focus:ring-2 focus:ring-border'
  ),
  underline: cx(
    'bg-transparent text-foreground border-0 border-b border-border rounded-none',
    'focus:border-b-primary focus:ring-0'
  ),
};

const stateCls: Record<Exclude<InputState, 'none'>, string> = {
  success: 'border-success focus:border-success focus:ring-success/30',
  warning: 'border-goldenYellow focus:border-goldenYellow focus:ring-goldenYellow/30',
  danger:  'border-sunsetRed focus:border-sunsetRed focus:ring-sunsetRed/30',
};

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <span
    role="status"
    aria-hidden="true"
    className={cx(
      'inline-block animate-spin rounded-full border-2 border-foreground/40 border-t-foreground',
      'h-4 w-4',
      className
    )}
  />
);

/** Named export preserved */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
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
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const isPasswordToggle = type === 'password' && passwordToggle;
  const [reveal, setReveal] = useState(false);

  const [uncontrolledVal, setUncontrolledVal] = useState<string | number | readonly string | undefined>(defaultValue);
  const controlled = value !== undefined;

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const describedIds: string[] = [];
  if (hint) describedIds.push(`${inputId}-hint`);
  if (error) describedIds.push(`${inputId}-error`);
  const describedBy = describedIds.length ? describedIds.join(' ') : undefined;

  const sz = sizeMap[size];

  const baseField = cx(
    'w-full placeholder-mutedText focus:outline-none transition-all duration-200',
    // turn off number spinners
    'appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
    variantBase[variant],
    variant !== 'underline' ? roundedMap[rounded] : '',
    sz.input,
    'pl-4 pr-4'
  );

  const tone =
    error ? stateCls.danger :
    state !== 'none' ? stateCls[state] :
    '';

  const leftPad = iconLeft ? 'pl-10' : addonLeft ? 'pl-0' : '';
  const rightStuff = iconRight || clearable || isPasswordToggle || loading || addonRight;
  const rightPad = rightStuff ? 'pr-10' : '';

  const fieldCls = cx(baseField, tone, leftPad, rightPad, className);

  const onClearClick = () => {
    if (controlled) {
      onClear?.();
      if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else {
      setUncontrolledVal('');
      onClear?.();
    }
    inputRef.current?.focus();
  };

  const currVal = (controlled ? value : uncontrolledVal) ?? '';
  const length = typeof currVal === 'string' ? currVal.length : String(currVal).length;

  return (
    <label htmlFor={inputId} className="block">
      {label && (
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
              roundedMap[rounded].replace('rounded', 'rounded-l'),
              sz.addon
            )}
          >
            {addonLeft}
          </span>
        )}

        {/* Left icon */}
        {iconLeft && (
          <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center text-mutedText opacity-70">
            {iconLeft}
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
            addonRight && variant !== 'underline' && 'rounded-r-none'
          )}
          aria-describedby={describedBy}
          aria-invalid={!!error || (state === 'danger') || undefined}
          value={controlled ? value : uncontrolledVal}
          onChange={(e) => {
            if (!controlled) setUncontrolledVal(e.target.value);
            props.onChange?.(e);
          }}
          maxLength={maxLength}
        />

        {/* Right cluster (icon/loader/buttons) */}
        <div className="absolute inset-y-0 right-2 flex items-center gap-2">
          {loading && <Spinner />}
          {iconRight && <span className="pointer-events-none inline-flex items-center text-mutedText opacity-70">{iconRight}</span>}

          {isPasswordToggle && (
            <button
              type="button"
              className="inline-flex items-center px-2 text-xs text-mutedText hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-border rounded-ds"
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
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-mutedText hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-border"
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
              roundedMap[rounded].replace('rounded', 'rounded-r'),
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
            <span id={`${inputId}-error`} className="block text-small text-sunsetRed">
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
  );
});
