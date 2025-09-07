import React from "react";

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    hint?: string;
    error?: string;
  };

export const Textarea: React.FC<TextareaProps> = ({
  label,
  hint,
  error,
  className = "",
  ...props
}) => {
  const base = [
    "w-full rounded-ds border border-border bg-card text-lightText placeholder-mutedText",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
    "dark:bg-dark/50 dark:text-foreground dark:placeholder-mutedText/40 dark:border-purpleVibe/30 dark:focus:ring-electricBlue dark:focus:border-electricBlue",
  ].join(" ");
  const invalid = error
    ? "border-sunsetOrange focus:ring-sunsetOrange focus:border-sunsetOrange"
    : "";

  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 inline-block text-small text-mutedText">
          {label}
        </span>
      )}
      <textarea className={`${base} ${invalid} p-4 min-h-[140px]`} {...props} />
      {error ? (
        <span className="mt-1 block text-small text-sunsetOrange">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-small text-mutedText">{hint}</span>
      ) : null}
    </label>
  );
};
