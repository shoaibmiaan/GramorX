import React from "react";
export function Spinner({ size = 20 }: { size?: number }) {
  const s = `${size}px`;
  return <span style={{ width: s, height: s }} className="pr-inline-block pr-border-2 pr-border-text/20 pr-border-t-primary pr-rounded-full pr-animate-spin" />;
}