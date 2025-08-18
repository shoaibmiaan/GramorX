import { PropsWithChildren } from "react";

export function Card({ children }: PropsWithChildren) {
  return (
    <div className="pr-rounded-2xl pr-bg-surface pr-text-text pr-border pr-border-border pr-shadow-glass pr-p-6 pr-animate-pop-in premium-glass">
      {children}
    </div>
  );
}
