import React from "react";

export const SocialIconLink: React.FC<{
  href: string;
  icon: string; // e.g., 'facebook-f', 'twitter', 'instagram'
  label: string;
  className?: string;
}> = ({ href, icon, label, className = "" }) => (
  <a
    href={href}
    aria-label={label}
    className={`w-10 h-10 rounded-full flex items-center justify-center transition
      bg-primary/10 text-primary hover:-translate-y-0.5
      dark:bg-purpleVibe/10 dark:text-neonGreen ${className}`}
  >
    <i className={`fab fa-${icon}`} aria-hidden="true" />
  </a>
);
