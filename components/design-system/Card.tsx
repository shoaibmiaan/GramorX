import * as React from "react";

function cn(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

export type CardProps = Readonly<{
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  interactive?: boolean; // adds hover/transition
  padding?: "none" | "sm" | "md" | "lg";
  insetBorder?: boolean; // subtle inner border
}>;

const padMap = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-6",
  lg: "p-6 sm:p-8",
} as const;

export function Card({
  as = "div",
  className,
  children,
  interactive,
  padding = "md",
  insetBorder,
}: CardProps) {
  const Comp = as as any;
  return (
    <Comp
      className={cn(
        // DS helpers / tokens
        "bg-card text-card-foreground border border-border rounded-ds-2xl",
        "shadow-sm overflow-hidden",
        insetBorder && "ring-1 ring-inset ring-border/50",
        interactive && "transition-transform hover:translate-y-[-1px] active:translate-y-[0px]",
        padMap[padding],
        className
      )}
    >
      {children}
    </Comp>
  );
}

export type CardHeaderProps = Readonly<{
  className?: string;
  children: React.ReactNode;
}>;

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn("px-4 py-3 sm:px-6 border-b border-border/60", className)}>
      {children}
    </div>
  );
}

export type CardContentProps = Readonly<{
  className?: string;
  children: React.ReactNode;
}>;

export function CardContent({ className, children }: CardContentProps) {
  return <div className={cn("p-4 sm:p-6", className)}>{children}</div>;
}

export type CardFooterProps = Readonly<{
  className?: string;
  children: React.ReactNode;
}>;

export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={cn("px-4 py-3 sm:px-6 border-t border-border/60", className)}>
      {children}
    </div>
  );
}
