import * as React from "react";

function cn(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

export type SelectProps = Readonly<
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
    label?: string;
    hint?: string;
    error?: string | null;
    required?: boolean;
    size?: "sm" | "md" | "lg";
    leftSlot?: React.ReactNode;
    rightSlot?: React.ReactNode;
  }
>;

const sizes: Record<NonNullable<SelectProps["size"]>, string> = {
  sm: "h-9 text-sm",
  md: "h-11 text-base",
  lg: "h-12 text-base",
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      hint,
      error,
      required,
      className,
      size = "md",
      leftSlot,
      rightSlot,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id ?? React.useId();
    const hintId = hint ? `${selectId}-hint` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1 block text-sm font-medium text-muted-foreground"
          >
            {label} {required && <span aria-hidden="true" className="text-sunsetOrange">*</span>}
          </label>
        )}

        <div
          className={cn(
            "relative flex items-center rounded-ds-2xl border bg-input text-foreground",
            error ? "border-sunsetOrange" : "border-border",
            "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
          )}
        >
          {leftSlot && <span className="pl-3 pr-2 inline-flex">{leftSlot}</span>}

          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              "w-full bg-transparent outline-none appearance-none pr-10 pl-3",
              // iOS zoom guard
              "text-[16px]",
              sizes[size],
              className
            )}
            {...props}
          >
            {children}
          </select>

          {/* Chevron */}
          <span className="pointer-events-none absolute right-3 inline-flex translate-y-[-1px]">
            ▼
          </span>

          {rightSlot && <span className="pr-3 pl-2 inline-flex">{rightSlot}</span>}
        </div>

        {hint && !error && (
          <p id={hintId} className="mt-1 text-xs text-muted-foreground">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-1 text-xs text-sunsetOrange">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
