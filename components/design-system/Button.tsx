// components/design-system/Button.tsx
import React from "react";
import type {
  ReactNode,
  ElementType,
  ComponentPropsWithoutRef,
} from "react";

type ButtonVariant = "primary" | "secondary" | "accent";

// Polymorphic Button props
type ButtonProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export const Button = <T extends ElementType = "button">({
  as,
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonProps<T>) => {
  const Component = as || "button";
  const classes = ["btn", `btn-${variant}`, className].filter(Boolean).join(" ");

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
};
