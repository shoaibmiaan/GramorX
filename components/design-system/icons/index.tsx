// components/design-system/icons/index.tsx
import * as React from 'react'
import { Icon } from '@/components/design-system/Icon'

type IconProps = React.ComponentProps<'svg'> & {
  className?: string
  'aria-hidden'?: boolean
}

export const MailIcon: React.FC<IconProps> = (props) => <Icon name="mail" {...props} />
export const PhoneIcon: React.FC<IconProps> = (props) => <Icon name="phone" {...props} />
export const MapPinIcon: React.FC<IconProps> = (props) => <Icon name="map-pin" {...props} />

const Icons = { MailIcon, PhoneIcon, MapPinIcon }
export default Icons
