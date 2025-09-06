import React from 'react';

type Variant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
type Size = 'sm' | 'md';
type Appearance = 'soft' | 'outline' | 'solid';

export const Badge: React.FC<{
  variant?: Variant | string;     // accept any string; normalize at runtime
  size?: Size;
  appearance?: Appearance | string;
  icon?: React.ReactNode;
  dot?: boolean;
  shape?: 'pill' | 'rounded';
  uppercase?: boolean;
  elevated?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({
  variant = 'neutral',
  size = 'md',
  appearance = 'soft',
  icon,
  dot = false,
  shape = 'pill',
  uppercase = false,
  elevated = false,
  className = '',
  children,
}) => {
  const cx = (...xs: Array<string | false | null | undefined>) =>
    xs.filter(Boolean).join(' ');

  // --- Normalizers (fixes runtime crashes from unknown props) ---
  const VARIANT_ALIAS: Record<string, Variant> = {
    // canonical
    neutral: 'neutral', info: 'info', success: 'success', warning: 'warning', danger: 'danger',
    // common synonyms
    default: 'neutral', primary: 'info', informative: 'info',
    ok: 'success', positive: 'success', done: 'success',
    warn: 'warning',
    error: 'danger', negative: 'danger', failed: 'danger',
  };
  const APPEARANCE_ALIAS: Record<string, Appearance> = {
    soft: 'soft', outline: 'outline', solid: 'solid', default: 'soft', subtle: 'soft',
    bordered: 'outline', filled: 'solid',
  };

  const normalizeVariant = (v: unknown): Variant => {
    const key = String(v ?? '').toLowerCase().trim();
    return VARIANT_ALIAS[key] ?? 'neutral';
  };
  const normalizeAppearance = (a: unknown): Appearance => {
    const key = String(a ?? '').toLowerCase().trim();
    return APPEARANCE_ALIAS[key] ?? 'soft';
  };

  const v = normalizeVariant(variant);
  const a = normalizeAppearance(appearance);

  // --- Tokens ---
  const sizes: Record<Size, string> = {
    sm: 'text-small px-2.5 py-1',
    md: 'text-body px-3.5 py-1.5',
  };
  const iconSize: Record<Size, string> = {
    sm: '[&>svg]:h-3.5 [&>svg]:w-3.5',
    md: '[&>svg]:h-4 [&>svg]:w-4',
  };
  const shapeCls = shape === 'pill' ? 'rounded-full' : 'rounded-ds';

  // Explicit classes for Tailwind JIT (no computed color names)
  const tone = {
    neutral: {
      soft:    'bg-foreground/5 text-foreground border-border',
      outline: 'bg-transparent text-foreground border-border',
      solid:   'bg-foreground text-background border-foreground',
      dot:     'bg-foreground',
    },
    success: {
      soft:    'bg-success/10 text-success border-success/30',
      outline: 'bg-transparent text-success border-success',
      solid:   'bg-success text-lightText border-success',
      dot:     'bg-success',
    },
    warning: {
      soft:    'bg-goldenYellow/10 text-goldenYellow border-goldenYellow/30',
      outline: 'bg-transparent text-goldenYellow border-goldenYellow',
      solid:   'bg-goldenYellow text-dark border-goldenYellow',
      dot:     'bg-goldenYellow',
    },
    danger: {
      soft:    'bg-sunsetRed/10 text-sunsetRed border-sunsetRed/30',
      outline: 'bg-transparent text-sunsetRed border-sunsetRed',
      solid:   'bg-sunsetRed text-lightText border-sunsetRed',
      dot:     'bg-sunsetRed',
    },
    info: {
      soft:    'bg-electricBlue/10 text-electricBlue border-electricBlue/30',
      outline: 'bg-transparent text-electricBlue border-electricBlue',
      solid:   'bg-electricBlue text-lightText border-electricBlue',
      dot:     'bg-electricBlue',
    },
  } as const;

  // ultra-safe fallback even if v was unknown
  const t = tone[v] ?? tone.neutral;

  const appearanceCls =
    a === 'soft'
      ? cx(t.soft, 'border')
      : a === 'outline'
      ? cx(t.outline, 'border')
      : cx(t.solid, 'border');

  return (
    <span
      role="status"
      aria-live="polite"
      data-variant={v}
      data-size={size}
      data-appearance={a}
      className={cx(
        'inline-flex items-center gap-2 leading-none whitespace-nowrap select-none',
        sizes[size],
        shapeCls,
        appearanceCls,
        uppercase && 'uppercase tracking-wide',
        elevated && 'shadow-glow',
        className
      )}
    >
      {dot && <span className={cx('h-1.5 w-1.5 rounded-full shrink-0', t.dot)} aria-hidden="true" />}
      {icon && <span className={cx('inline-flex shrink-0', iconSize[size])}>{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};
