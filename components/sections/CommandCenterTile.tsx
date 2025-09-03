import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface CommandCenterTileProps {
  label: string;
  href: string;
  icon: string;
  className?: string;
}

export const CommandCenterTile: React.FC<CommandCenterTileProps> = ({ label, href, icon, className }) => (
  <Link
    href={href}
    className={cn(
      'rounded-ds-xl border border-border px-4 py-3 text-sm font-medium hover:bg-electricBlue/5 transition flex items-center justify-between',
      className,
    )}
  >
    <span>{label}</span>
    <i className={`fas ${icon} text-grayish`} aria-hidden="true" />
  </Link>
);

export default CommandCenterTile;
