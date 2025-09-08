import * as React from 'react'
import { Icon } from '@/components/design-system/Icon'

type IconProps = React.ComponentProps<'svg'> & {
  className?: string
  'aria-hidden'?: boolean
}

/** Existing wrappers */
export const MailIcon: React.FC<IconProps> = (props) => <Icon name="mail" {...props} />
export const PhoneIcon: React.FC<IconProps> = (props) => <Icon name="phone" {...props} />
export const MapPinIcon: React.FC<IconProps> = (props) => <Icon name="map-pin" {...props} />

/** Brand/social + SMS (simple inline SVGs to unblock build) */
export const GoogleIcon: React.FC<IconProps> = ({ className, ...rest }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden {...rest}>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 31.7 29.4 35 24 35c-7 0-12.8-5.8-12.8-12.8S17 9.5 24 9.5c3.2 0 6.1 1.2 8.3 3.2l5.6-5.6C34.3 3.9 29.4 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1-.1-2-.3-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.2 0 6.1 1.2 8.3 3.2l5.6-5.6C34.3 6 29.4 4 24 4 15.5 4 8.2 8.8 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.3l-6.2-5.1C29.2 35.6 26.8 36.5 24 36.5c-5.3 0-9.8-3.3-11.4-8l-6.5 5C8 39.2 15.4 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.9-5 6.5-9.3 6.5-2.7 0-5.2-.9-7.2-2.5l-6.5 5C14 40.8 18.7 43 24 43c11 0 21-8 21-22 0-1-.1-2-.4-3.5z"/>
  </svg>
)

export const FacebookIcon: React.FC<IconProps> = ({ className, ...rest }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
    <path fill="currentColor" d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07C1.86 17.06 5.45 21.12 10.2 22v-7.03H7.6v-2.9h2.6V9.8c0-2.57 1.53-3.99 3.87-3.99 1.12 0 2.29.2 2.29.2v2.52h-1.29c-1.27 0-1.66.79-1.66 1.61v1.93h2.83l-.45 2.9h-2.38V22c4.75-.88 8.34-4.94 8.34-9.93z"/>
  </svg>
)

export const AppleIcon: React.FC<IconProps> = ({ className, ...rest }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
    <path fill="currentColor" d="M16.36 1.64c.03.3.04.61 0 .92-.07.61-.33 1.2-.75 1.68-.41.48-.94.86-1.53 1.1-.3.12-.62.2-.94.23-.03-.3-.02-.6.05-.9.14-.6.43-1.15.84-1.62.41-.47.93-.84 1.51-1.08.28-.12.58-.2.88-.23.28-.03.58-.03.87 0zM20.9 17.02c-.48 1.12-1.07 2.16-1.77 3.11-.69.93-1.47 1.86-2.53 1.87-1.01.02-1.34-.61-2.51-.61-1.18 0-1.53.6-2.52.63-1.04.04-1.83-1.02-2.52-1.95-1.37-1.86-2.42-5.25-1.01-7.55.7-1.15 1.95-1.88 3.31-1.9 1.06-.02 2.07.68 2.51.68.43 0 1.57-.83 2.65-.71.45.02 1.72.18 2.53 1.36-2.23 1.22-1.86 4.41.86 4.69z"/>
  </svg>
)

export const SmsIcon: React.FC<IconProps> = ({ className, ...rest }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
    <path fill="currentColor" d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM6 9h12v2H6V9zm0-3h12v2H6V6zm0 6h8v2H6v-2z"/>
  </svg>
)

/** Default export (optional) */
const Icons = { MailIcon, PhoneIcon, MapPinIcon, GoogleIcon, FacebookIcon, AppleIcon, SmsIcon }
export default Icons
