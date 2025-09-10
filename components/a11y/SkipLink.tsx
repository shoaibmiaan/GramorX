import React from "react";

export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50 rounded-md bg-card px-3 py-2 text-sm shadow"
    >
      Skip to content
    </a>
  );
}
