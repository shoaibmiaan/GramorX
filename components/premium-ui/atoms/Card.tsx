import React from "react";
import { cn } from "../utils/cn";
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> { padding?: "none"|"sm"|"md"|"lg"; glass?: boolean }
export function Card({ className, children, padding = "md", glass = true, ...props }: CardProps) {
  const pad = padding === "none" ? "pr-p-0" : padding === "sm" ? "pr-p-3" : padding === "lg" ? "pr-p-8" : "pr-p-6";
  return (
    <div className={cn("pr-rounded-2xl pr-bg-surface pr-border pr-border-border pr-shadow-soft", glass && "premium-glass", pad, className)} {...props}>
      {children}
    </div>
  );
}