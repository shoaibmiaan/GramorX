import React from "react"; import { cn } from "../utils/cn";
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> { label?: string }
export function Switch({ className, label, ...props }: SwitchProps) {
  return (
    <label className={cn("pr-inline-flex pr-items-center pr-gap-2 pr-cursor-pointer", className)}>
      <input type="checkbox" className="pr-sr-only" {...props} />
      <span className="pr-relative pr-h-6 pr-w-10 pr-bg-muted/30 pr-rounded-full pr-transition peer-checked:pr-bg-primary pr-outline-none pr-ring-2 pr-ring-transparent focus:pr-ring-ring/60">
        <span className="pr-absolute pr-top-1 pr-left-1 pr-h-4 pr-w-4 pr-bg-surface pr-rounded-full pr-transition peer-checked:pr-translate-x-4" />
      </span>
      {label ? <span className="pr-text-sm pr-text-muted">{label}</span> : null}
    </label>
  );
}