// components/design-system/Skeleton.tsx
import * as React from 'react'

export const Skeleton: React.FC<{ className?: string; shape?: 'rect' | 'circle'; animated?: boolean }> = ({
  className = '',
  shape = 'rect',
  animated = true,
}) => {
  return (
    <div
      className={[
        animated ? 'animate-pulse' : '',
        shape === 'circle' ? 'rounded-full' : 'rounded-ds',
        'bg-muted',
        className,
      ].join(' ')}
    />
  )
}

export default Skeleton
