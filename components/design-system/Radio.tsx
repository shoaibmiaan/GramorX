import React from "react";

export type RadioProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Radio: React.FC<RadioProps> = ({
  label,
  hint,
  error,
  className = "",
  ...props
}) => {
  return (
    <label className={`flex items-start gap-3 ${className}`}>
      <input
        type="radio"
        className={[
          "mt-1 h-5 w-5 border rounded-full",
          "text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus:outline-none",
          "dark:bg-dark/50 dark:border-purpleVibe/30 ",
          error
            ? "border-sunsetOrange focus-visible:ring focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            : "border-border",
        ].join(" ")}
        {...props}
      />
      <div>
        {label && <div className="text-body">{label}</div>}
        {error ? (
          <div className="text-small text-sunsetOrange">{error}</div>
        ) : hint ? (
          <div className="text-small text-mutedText">{hint}</div>
        ) : null}
      </div>
    </label>
  );
};
