// components/design-system/StreakIndicator.tsx
import * as React from 'react'
import { useStreak } from '@/hooks/useStreak'
import { getDayKeyInTZ } from '@/lib/streak'

const cx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ')

type Tone = 'electric' | 'primary' | 'accent'
type Props = {
  className?: string
  value?: number        // external streak value; disables autoClaim
  compact?: boolean
  autoClaim?: boolean   // default: true (ignored if value is provided)
  tone?: Tone
}

const FireIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...p}>
    <path fill="currentColor" d="M12 2c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1 .2-1.9.6-2.8C6 8 4 10.3 4 13.5A7.5 7.5 0 0 0 11.5 21h1A7.5 7.5 0 0 0 20 13.5C20 7.5 14 6 12 2z"/>
  </svg>
)
const ShieldIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...p}>
    <path fill="currentColor" d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4z"/>
  </svg>
)

export const StreakIndicator: React.FC<Props> = ({
  className = '',
  value,
  compact = false,
  autoClaim = true,
  tone = 'electric',
}) => {
  const { current, lastDayKey, completeToday, loading, shields = 0 } = useStreak()
  const todayKey = React.useMemo(() => getDayKeyInTZ(), [])
  const autoTriedRef = React.useRef(false)

  const streakValue = value ?? current

  // Auto-claim once (only when using internal hook value)
  React.useEffect(() => {
    if (value !== undefined) return // external control → don't auto-claim
    if (autoTriedRef.current || loading) return
    autoTriedRef.current = true
    if (autoClaim && lastDayKey !== todayKey) {
      completeToday().catch(() => {})
    }
  }, [value, autoClaim, loading, lastDayKey, todayKey, completeToday])

  // subtle glow on change
  const [pulse, setPulse] = React.useState(false)
  React.useEffect(() => {
    if (!loading && streakValue >= 0) {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 900)
      return () => clearTimeout(t)
    }
  }, [streakValue, loading])

  const toneCls =
    tone === 'primary'
      ? 'border-primary/30 bg-primary/10 text-primary'
      : tone === 'accent'
      ? 'border-accent/30 bg-accent/10 text-accent'
      : 'border-electricBlue/30 bg-electricBlue/10 text-electricBlue' // electric (default)

  const density = compact ? 'px-2.5 py-1.5 text-sm' : 'px-3.5 py-2'
  const pulseShadow = pulse ? 'shadow-[0_0_0_6px_rgba(0,187,249,0.25)] transition-shadow' : ''

  return (
    <div
      className={cx(
        'inline-flex items-center gap-2 rounded-ds border',
        toneCls,
        'dark:border-current/40',
        density,
        pulseShadow,
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`Current streak ${Math.max(streakValue ?? 0, 0)} days, ${shields} shields left`}
      title={`Streak: ${streakValue ?? 0}`}
    >
      <FireIcon />
      <span className="font-semibold tabular-nums">{Math.max(streakValue ?? 0, 0)}</span>
      <span className="mx-1 opacity-40">•</span>
      <ShieldIcon />
      <span className="font-semibold tabular-nums">{shields}</span>
    </div>
  )
}

export default StreakIndicator
