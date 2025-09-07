import React from "react";

type BaseProps = {
  number: number;
  children?: React.ReactNode;
  className?: string;
  status?: "default" | "answered" | "flagged" | "review";
};

const statusRing: Record<NonNullable<BaseProps["status"]>, string> = {
  default: "border-border dark:border-border/20",
  answered: "border-success/60",
  flagged: "border-goldenYellow/60",
  review: "border-electricBlue/60",
};

export const QuestionShell: React.FC<BaseProps> = ({
  number,
  status = "default",
  className = "",
  children,
}) => {
  return (
    <div className={`card-surface rounded-ds p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div
          className={`h-7 w-7 rounded-full border-2 flex items-center justify-center text-small tabular-nums ${statusRing[status]}`}
        >
          {number}
        </div>
        {status !== "default" && (
          <span className="text-small opacity-75">
            {status === "answered"
              ? "Answered"
              : status === "flagged"
                ? "Flagged"
                : "Marked for review"}
          </span>
        )}
      </div>
      {children}
    </div>
  );
};

/** MCQ (single choice) */
export const QuestionMCQ: React.FC<{
  number: number;
  options: { key: string; label: string }[];
  value?: string;
  onChange?: (val: string) => void;
  status?: BaseProps["status"];
  name?: string;
  className?: string;
}> = ({ number, options, value, onChange, status, name, className = "" }) => {
  const group = name ?? `q-${number}`;
  return (
    <QuestionShell number={number} status={status} className={className}>
      <fieldset>
        <legend className="sr-only">Question {number}</legend>
        <div className="grid gap-2">
          {options.map((opt) => (
            <label
              key={opt.key}
              className="flex items-center gap-3 p-2 rounded-ds hover:bg-border/20 dark:hover:bg-foreground/5"
            >
              <input
                type="radio"
                name={group}
                className="h-4 w-4 text-primary focus-visible:ring focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background "
                checked={value === opt.key}
                onChange={() => onChange?.(opt.key)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </QuestionShell>
  );
};

/** True/False/Not Given */
export const QuestionTFNG: React.FC<{
  number: number;
  value?: "T" | "F" | "NG";
  onChange?: (val: "T" | "F" | "NG") => void;
  status?: BaseProps["status"];
  className?: string;
}> = ({ number, value, onChange, status, className = "" }) => {
  const opts: Array<{ k: "T" | "F" | "NG"; l: string }> = [
    { k: "T", l: "True" },
    { k: "F", l: "False" },
    { k: "NG", l: "Not Given" },
  ];
  return (
    <QuestionShell number={number} status={status} className={className}>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <button
            key={o.k}
            type="button"
            onClick={() => onChange?.(o.k)}
            className={`px-3 py-2 rounded-ds border text-small
              ${value === o.k ? "bg-primary text-primary-foreground dark:bg-electricBlue" : "bg-card dark:bg-dark/40 text-lightText dark:text-foreground"}
              border-border dark:border-border/20`}
            aria-pressed={value === o.k}
          >
            {o.l}
          </button>
        ))}
      </div>
    </QuestionShell>
  );
};

/** Gap Fill */
export const QuestionGapFill: React.FC<{
  number: number;
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  status?: BaseProps["status"];
  className?: string;
}> = ({
  number,
  value = "",
  onChange,
  placeholder = "Type your answer…",
  status,
  className = "",
}) => {
  return (
    <QuestionShell number={number} status={status} className={className}>
      <input
        type="text"
        className="w-full rounded-ds border border-border bg-card text-lightText placeholder-mutedText focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus:border-primary dark:bg-dark/50 dark:text-foreground dark:placeholder-mutedText/40 dark:border-purpleVibe/30  dark:focus:border-electricBlue px-3 py-2"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
    </QuestionShell>
  );
};
