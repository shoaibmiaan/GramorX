import React from "react"; import { cn } from "../utils/cn";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; hint?: string; error?: string }
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({ className, label, hint, error, ...props }, ref) {
  return (
    <div className={cn("pr-grid pr-gap-1", className)}>
      {label ? <label className="pr-text-sm pr-text-muted">{label}</label> : null}
      <input ref={ref} className={cn("pr-w-full pr-rounded-xl pr-border pr-border-border pr-bg-surface pr-text-text pr-px-3 pr-py-2 focus:pr-outline-none focus:pr-ring-2 focus:pr-ring-ring/80")}{...props}/>
      {hint && !error ? <p className="pr-text-xs pr-text-muted">{hint}</p> : null}
      {error ? <p className="pr-text-xs pr-text-danger">{error}</p> : null}
    </div>
  );
});