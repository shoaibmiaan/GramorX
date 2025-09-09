import * as React from "react";
import { Button } from "./Button";

function cn(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

export type ModalProps = Readonly<{
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  // mobile: full-screen by default; desktop uses size max-w
  className?: string;
}>;

const sizes: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
};

export function Modal({ open, onClose, title, children, size = "md", className }: ModalProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);

  // Close on ESC
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      aria-hidden={!open}
      className="fixed inset-0 z-50"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        ref={dialogRef}
        className={cn(
          // mobile = full screen sheet-like
          "absolute inset-x-0 bottom-0 top-auto h-auto max-h-[85vh] rounded-t-ds-2xl",
          "bg-card text-card-foreground border-t border-border shadow-xl",
          // desktop = centered card
          "sm:inset-0 sm:m-auto sm:h-auto sm:rounded-ds-2xl sm:border sm:shadow-2xl",
          sizes[size],
          "focus-visible:outline-none",
          className
        )}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold">
                {title}
              </h2>
            )}
            <Button
              aria-label="Close"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="shrink-0"
            >
              ✕
            </Button>
          </div>

          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
