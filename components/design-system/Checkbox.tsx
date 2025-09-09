import * as React from "react";

function cn(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

export type CheckboxProps = Readonly<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
    label?: React.ReactNode;
    description?: React.ReactNode;
    error?: string | null;
  }
>;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, label, description, error, className, ...props }, ref) => {
    const inputId = id ?? React.useId();
    const descId = description ? `${inputId}-desc` : undefined;
    const errId = error ? `${inputId}-error` : undefined;

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <span className="relative inline-flex items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            aria-describedby={error ? errId : descId}
            aria-invalid={!!error || undefined}
            className={cn(
              "peer h-5 w-5 shrink-0 rounded border",
              // DS tokens
              "text-primary",
              // focus-visible ring (fixed per your rule)
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              // base borders
              error ? "border-sunsetOrange" : "border-border",
              // dark bg cleanup (removed dark:focus classes)
              "bg-card"
            )}
            {...props}
          />
          {/* Check glyph (uses :checked pseudo-element via utility) */}
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="pointer-events-none absolute inset-0 m-auto h-3.5 w-3.5 opacity-0 peer-checked:opacity-100"
          >
            <path
              d="M4 10.5l3 3 9-9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <div className="min-w-0">
          {label && (
            <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
              {label}
            </label>
          )}
          {description && (
            <p id={descId} className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          )}
          {error && (
            <p id={errId} className="mt-0.5 text-sm text-sunsetOrange">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
