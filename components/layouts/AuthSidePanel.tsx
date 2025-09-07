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
    <div className="h-full flex flex-col justify-between p-10 bg-gradient-to-br from-purpleVibe/20 via-electricBlue/10 to-neonGreen/10 dark:from-dark/60 dark:via-dark/40 dark:to-darker">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Image src="/brand/logo.png" alt="GramorX" width={50} height={50} className="rounded-xl" priority />
          <h2 className="font-slab text-2xl font-bold text-gradient-primary">{title}</h2>
        </div>

        <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300 max-w-md">
          {description}
        </p>

        {features && features.length > 0 && (
          <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-300">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>

      {footerLink && (
        <div className="pt-6 text-sm text-gray-500 dark:text-gray-400">
          {footerLink}
        </div>
      )}
    </div>
  );
}
