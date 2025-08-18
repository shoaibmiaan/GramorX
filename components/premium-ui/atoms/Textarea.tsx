import React from "react"; import { cn } from "../utils/cn";
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea ref={ref} className={cn("pr-w-full pr-rounded-xl pr-border pr-border-border pr-bg-surface pr-text-text pr-px-3 pr-py-2 focus:pr-outline-none focus:pr-ring-2 focus:pr-ring-ring/80", className)} {...props} />
  );
});