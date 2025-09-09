import * as React from "react";

function cn(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

export type RadioProps = Readonly<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
    label?: React.ReactNode;
    description?: React.ReactNode;
    error?: string | null;
  }
>;

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ id, name, label, description, error, className, ...props }, ref) => {
    const inputId = id ?? React.useId();
    const descId = description ? `${inputId}-desc` : undefined;
    const errId = error ? `${inputId}-error` : undefined;

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <span className="relative inline-flex items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="radio"
            aria-describedby={error ? errId : descId}
            aria-invalid={!!error || undefined}
            className={cn(
              "peer h-5 w-5 shrink-0 rounded-full border",
              "text-primary",
              // focus-visible ring (fixed per your rule)
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              error ? "border-sunsetOrange" : "border-border",
              "bg-card"
            )}
            {...props}
          />
          {/* Dot */}
          <span className="pointer-events-none absolute h-2.5 w-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100" />
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
Radio.displayName = "Radio";
