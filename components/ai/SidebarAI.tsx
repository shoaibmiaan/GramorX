// components/ai/SidebarAI.tsx
import React, { useState, useEffect } from "react";

type SidebarAIProps = {
  /** Start opened or closed (default: closed) */
  initialOpen?: boolean;
  /** Notify parent when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Extra classes for the root wrapper */
  className?: string;
};

/**
 * Minimal SidebarAI stub to avoid build errors.
 * - No network calls, no markdown libraries, no persistence.
 * - Token classes only (no inline colors).
 * - Accessible: aria-controls/aria-expanded.
 * Expand later with real chat UI.
 */
const SidebarAI: React.FC<SidebarAIProps> = ({
  initialOpen = false,
  onOpenChange,
  className = "",
}) => {
  const [open, setOpen] = useState<boolean>(initialOpen);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  return (
    <div className={className}>
      {/* Toggle button — place this wherever you want to open the sidebar */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="ai-sidebar"
        className="ds-btn ds-btn-secondary"
      >
        {open ? "Close AI" : "Open AI"}
      </button>

      {/* Drawer */}
      {open && (
        <aside
          id="ai-sidebar"
          role="dialog"
          aria-label="AI Assistant"
          className="fixed bottom-0 right-0 z-50 w-full sm:w-[420px] h-[65vh] sm:h-[80vh] border border-border bg-card text-foreground rounded-t-2xl sm:rounded-l-2xl shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border px-4 h-12">
            <div className="text-sm font-medium">AI Assistant (Stub)</div>
            <button
              type="button"
              onClick={close}
              className="ds-btn ds-btn-ghost"
              aria-label="Close"
            >
              Close
            </button>
          </div>

          <div className="p-4 text-sm text-muted-foreground space-y-3">
            <p>
              This is a placeholder for the docked AI sidebar. We’ll add chat,
              actions, and context later.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>No external libraries</li>
              <li>No network calls</li>
              <li>Design-system token classes only</li>
            </ul>

            <div className="mt-4 rounded-lg border border-dashed border-border p-3">
              <p className="text-xs">
                TODO: hook providers, message list, input box, function calls,
                voice, and context.
              </p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export default SidebarAI;
