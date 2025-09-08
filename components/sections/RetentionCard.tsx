import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface RetentionCardProps {
  heading: string;
  description: string;
  href: string;
  icon: string;
  className?: string;
}

export const RetentionCard: React.FC<RetentionCardProps> = ({
  heading,
  description,
  href,
  icon,
  className,
}) => (
  <Link
    href={href}
    className={cn(
      'rounded-ds-2xl border border-purpleVibe/20 p-6 hover:border-purpleVibe/40 hover:-translate-y-1 transition block',
      className,
    )}
  >
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full grid place-items-center text-white bg-gradient-to-br from-purpleVibe to-electricBlue">
        <i className={`fas ${icon}`} aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-h3 mb-1">{heading}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  </Link>
);

export default RetentionCard;
