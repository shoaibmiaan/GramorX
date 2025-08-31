import React from 'react';
import Image from 'next/image';

export interface AuthSidePanelProps {
  title: string;
  description: React.ReactNode;
  features?: React.ReactNode[];
  footerLink?: React.ReactNode;
}

export default function AuthSidePanel({ title, description, features, footerLink }: AuthSidePanelProps) {
  return (
    <div className="h-full flex flex-col justify-between p-8 md:p-12 bg-gradient-to-br from-purpleVibe/10 via-electricBlue/5 to-neonGreen/10 dark:from-dark/50 dark:via-dark/30 dark:to-darker/60">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Image src="/brand/logo.png" alt="GramorX" width={40} height={40} className="rounded-ds object-contain" priority />
          <h2 className="font-slab text-h2 text-gradient-primary">{title}</h2>
        </div>
        <p className="text-body text-grayish dark:text-gray-300 max-w-md">{description}</p>
        {features && features.length > 0 && (
          <ul className="mt-6 space-y-3 text-body text-grayish dark:text-gray-300">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3">
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
      {footerLink && <div className="pt-8 text-small text-grayish dark:text-gray-400">{footerLink}</div>}
    </div>
  );
}

