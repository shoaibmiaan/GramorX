// components/challenge/ChallengeCohortCard.tsx
import * as React from "react";
import Link from "next/link";
import { useState } from "react";
import type { ChallengeCohortId } from "@/types/challenge";
// If you have DS Button/Card, keep these imports; otherwise this component
// uses token classes directly and won't break.
import { Card } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";

export type CohortCardProps = {
  id: ChallengeCohortId;
  title: string;
  description: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  totalTasks: number;
  enrolled?: boolean;
  progressPct?: number; // 0..100
  onEnroll?: (cohortId: ChallengeCohortId) => Promise<void> | void;
};

export function ChallengeCohortCard({
  id,
  title,
  description,
  startDate,
  endDate,
  totalTasks,
  enrolled = false,
  progressPct = 0,
  onEnroll,
}: CohortCardProps) {
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    if (!onEnroll) return;
    try {
      setLoading(true);
      await onEnroll(id);
    } finally {
      setLoading(false);
    }
  };

  // Format (keeps locale-safe without external libs)
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const body = (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
          {fmt(startDate)} → {fmt(endDate)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative h-2 w-full overflow-hidden rounded bg-border/50">
          <div
            className="absolute left-0 top-0 h-full bg-primary"
            style={{ width: `${Math.min(Math.max(progressPct, 0), 100)}%` }}
            aria-hidden="true"
          />
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {Math.round(progressPct)}%
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {totalTasks} tasks • {enrolled ? "Enrolled" : "Not enrolled"}
        </span>

        {enrolled ? (
          <Link
            href={`/challenge/${encodeURIComponent(id)}`}
            className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
          >
            Continue
          </Link>
        ) : onEnroll ? (
          <Button
            type="button"
            onClick={handleEnroll}
            disabled={loading}
            className="px-3 py-1.5 text-sm"
          >
            {loading ? "Joining…" : "Join challenge"}
          </Button>
        ) : (
          <Link
            href={`/challenge?enroll=${encodeURIComponent(id)}`}
            className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
          >
            Join challenge
          </Link>
        )}
      </div>
    </div>
  );

  // Prefer DS Card if available; otherwise render a tokenized container.
  return Card ? (
    <Card className="bg-card text-foreground">{body}</Card>
  ) : (
    <div className="rounded-xl border border-border bg-card p-4 text-foreground">{body}</div>
  );
}
