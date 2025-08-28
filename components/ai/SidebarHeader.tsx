// components/ai/SidebarHeader.tsx
import React from "react";

/** Keep a wide union so any caller prop won't break */
export type ConnState = "idle" | "online" | "stalled" | "offline" | "error";

interface SidebarHeaderProps {
  title?: string;
  status?: ConnState;
  onClose?: () => void;
  className?: string;
}

/** Minimal, dependency-free header bar */
const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  title = "AI Assistant",
  status = "idle",
  onClose,
  className = "",
}) => {
  const dotClass =
    status === "online"
      ? "bg-success"
      : status === "stalled"
      ? "bg-accent"
      : status === "offline" || status === "error"
      ? "bg-destructive"
      : "bg-muted-foreground";

  return (
    <div
      className={`flex items-center justify-between border-b border-border px-4 h-12 bg-card ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotClass}`} />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <button
        type="button"
        className="ds-btn ds-btn-ghost"
        onClick={onClose}
        aria-label="Close"
      >
        Close
      </button>
    </div>
  );
};

export default SidebarHeader;
