import React from "react";
import { cn } from "../utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size; loading?: boolean; leftIcon?: React.ReactNode; rightIcon?: React.ReactNode;
}

const base = "pr-inline-flex pr-items-center pr-justify-center pr-rounded-2xl pr-font-medium pr-transition pr-duration-150 focus:pr-outline-none focus:pr-ring-2 focus:pr-ring-ring/80 disabled:pr-opacity-60 disabled:pr-cursor-not-allowed";
const variants: Record<Variant,string> = {
  primary: "pr-bg-primary pr-text-primaryFg hover:pr-bg-primary/90",
  secondary: "pr-bg-surface pr-text-text pr-border pr-border-border hover:pr-bg-surface/80",
  ghost: "pr-bg-transparent pr-text-text hover:pr-bg-surface/60",
  danger: "pr-bg-danger pr-text-white hover:pr-bg-danger/90",
};
const sizes: Record<Size,string> = { sm: "pr-h-9 pr-px-3 pr-text-sm", md: "pr-h-11 pr-px-4 pr-text-base", lg: "pr-h-12 pr-px-6 pr-text-base" };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant = "primary", size = "md", loading, leftIcon, rightIcon, children, ...props }, ref) {
  return (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {leftIcon ? <span className="pr-mr-2 pr-inline-flex pr-items-center">{leftIcon}</span> : null}
      <span className={cn(loading && "pr-opacity-0")}>{children}</span>
      {rightIcon ? <span className="pr-ml-2 pr-inline-flex pr-items-center">{rightIcon}</span> : null}
      {loading ? <span className="pr-absolute pr-inline-flex pr-items-center pr-justify-center"><span className="pr-h-4 pr-w-4 pr-border-2 pr-border-white/30 pr-border-t-white pr-rounded-full pr-animate-spin"/></span> : null}
    </button>
  );
});