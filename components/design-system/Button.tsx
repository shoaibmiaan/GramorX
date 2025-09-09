import * as React from "react";

function cn(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

export type ButtonProps = Readonly<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive";
    size?: "sm" | "md" | "lg";
    block?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
  }
>;

const base =
  "inline-flex items-center justify-center rounded-ds-2xl border transition-colors select-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-primary text-primary-foreground border-transparent hover:bg-primary/90",
  secondary:
    "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/90",
  ghost: "bg-transparent text-foreground border-transparent hover:bg-accent",
  outline: "bg-transparent text-foreground border-border hover:bg-accent border",
  destructive:
    "bg-sunsetOrange text-white border-transparent hover:bg-sunsetOrange/90",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-base",
  lg: "h-12 px-6 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      block,
      leadingIcon,
      trailingIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], block && "w-full", className)}
        {...props}
      >
        {leadingIcon && <span className="mr-2 inline-flex">{leadingIcon}</span>}
        <span className="truncate">{children}</span>
        {trailingIcon && <span className="ml-2 inline-flex">{trailingIcon}</span>}
      </button>
    );
  }
);
Button.displayName = "Button";
