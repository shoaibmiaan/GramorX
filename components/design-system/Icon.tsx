import * as React from 'react'
import {
  X, Eye, EyeOff, Flame, Shield, Bell, Check, AlertTriangle, Info,
  ArrowRight
} from 'lucide-react'

const map: Record<string, React.ElementType> = {
  'times': X, 'close': X, 'x': X,
  'eye': Eye, 'eye-slash': EyeOff,
  'fire': Flame, 'shield': Shield, 'shield-alt': Shield,
  'bell': Bell, 'check': Check, 'exclamation-triangle': AlertTriangle, 'info-circle': Info,
  'arrow-right': ArrowRight,
}

export const Icon: React.FC<{ name: string; className?: string; 'aria-hidden'?: boolean }> = ({ name, className='', ...rest }) => {
  const key = String(name || '').toLowerCase().replace(/^fa-/, '')
  const Cmp = map[key]
  if (!Cmp) return null
  return <Cmp className={className} aria-hidden {...rest} />
}
export default Icon
