import React from "react";
import { cn } from "../utils/cn";

type Tone = "default" | "success" | "warning" | "danger";
const toneCls: Record<Tone,string> = {
  default: "pr-bg-accent/20 pr-text-accent pr-border pr-border-accent/40",
  success: "pr-bg-success/15 pr-text-success pr-border pr-border-success/30",
  warning: "pr-bg-warning/15 pr-text-warning pr-border pr-border-warning/30",
  danger: "pr-bg-danger/15 pr-text-danger pr-border pr-border-danger/30",
};
export function Badge({ children, className, tone = "default" as Tone }: { children: React.ReactNode; className?: string; tone?: Tone }) {
  return <span className={cn("pr-inline-flex pr-items-center pr-rounded-xl pr-px-2.5 pr-py-1 pr-text-xs pr-font-medium", toneCls[tone], className)}>{children}</span>;
}