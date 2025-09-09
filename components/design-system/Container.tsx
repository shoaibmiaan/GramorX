import * as React from "react";

function cn(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

export type ContainerProps = Readonly<{
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
  fluid?: boolean; // if true: full-width without max-w
}>;

export function Container({ as = "div", className, children, fluid }: ContainerProps) {
  const Comp = as as any;
  return (
    <Comp
      className={cn(
        fluid ? "w-full" : "mx-auto w-full max-w-7xl",
        "px-4 sm:px-6 lg:px-8",
        "min-h-[1px]", // avoid collapse
        className
      )}
    >
      {children}
    </Comp>
  );
}
