import * as React from 'react'
import {
  X, Eye, EyeOff, Flame, Shield, Bell, Check, AlertTriangle, Info, ArrowRight,
  Book, Lock, Gift, Star, StarHalf, Gauge, User, LogOut, StepBack, Pause, Play,
  StepForward, ChevronRight, CheckCircle, IdCard
} from 'lucide-react'

const map: Record<string, React.ElementType> = {
  // Common FA aliases seen in the repo
  'times': X, 'close': X, 'x': X,
  'eye': Eye, 'eye-slash': EyeOff,
  'fire': Flame,
  'shield': Shield, 'shield-alt': Shield,
  'bell': Bell,
  'check': Check, 'check-circle': CheckCircle, 'circle-check': CheckCircle,
  'exclamation-triangle': AlertTriangle,
  'info-circle': Info,
  'arrow-right': ArrowRight, 'chevron-right': ChevronRight,
  'book': Book,
  'lock': Lock,
  'gift': Gift,
  'star': Star, 'star-half-alt': StarHalf,
  'gauge': Gauge, 'tachometer-alt': Gauge,
  'id-badge': IdCard,
  'user': User, 'sign-out-alt': LogOut,
  'step-backward': StepBack, 'pause': Pause, 'play': Play, 'step-forward': StepForward,
}

export const Icon: React.FC<{ name: string; className?: string; 'aria-hidden'?: boolean }> = ({
  name, className = '', ...rest
}) => {
  const key = String(name || '').toLowerCase().replace(/^fa-/, '')
  const Cmp = map[key]
  if (!Cmp) return null
  return <Cmp className={className} aria-hidden {...rest} />
}

export default Icon
