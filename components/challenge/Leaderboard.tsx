// components/challenge/Leaderboard.tsx
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { ChallengeLeaderboardEntry } from "@/types/challenge";

export type LeaderboardProps = {
  cohortId: string;
  initial?: ReadonlyArray<ChallengeLeaderboardEntry>;
};

export function Leaderboard({ cohortId, initial = [] }: LeaderboardProps) {
  const [rows, setRows] = useState<ChallengeLeaderboardEntry[]>([...initial]);
  const [loading, setLoading] = useState<boolean>(!initial.length);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/challenge/leaderboard?cohort=${encodeURIComponent(cohortId)}`);
      if (!res.ok) throw new Error("Failed to load leaderboard");
      const json = (await res.json()) as { ok: boolean; leaderboard?: ChallengeLeaderboardEntry[]; error?: string };
      if (!json.ok || !json.leaderboard) throw new Error(json.error || "Unknown error");
      setRows(json.leaderboard);
    } catch (e: any) {
      setError(e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initial.length) void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortId]);

  const top3 = useMemo(() => rows.slice(0, 3), [rows]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Leaderboard</h4>
        <button
          type="button"
          onClick={fetchData}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground hover:bg-border/30 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-border bg-card px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {loading && !rows.length ? (
          Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-3 py-2">
              <div className="h-6 w-6 animate-pulse rounded bg-border" />
              <div className="h-6 w-6 animate-pulse rounded-full bg-border" />
              <div className="h-3 w-40 animate-pulse rounded bg-border" />
            </li>
          ))
        ) : rows.length ? (
          rows.map((r) => (
            <li key={r.userId} className="flex items-center gap-3 px-3 py-2">
              <span
                className={`grid h-6 w-6 place-items-center rounded text-xs ${
                  r.rank <= 3 ? "bg-primary text-background" : "border border-border text-muted-foreground"
                }`}
                aria-label={`Rank ${r.rank}`}
              >
                {r.rank}
              </span>

              <Avatar name={r.fullName} src={r.avatarUrl} />

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-foreground">{r.fullName}</div>
                <div className="text-xs text-muted-foreground">
                  {r.completedTasks}/{r.totalTasks} tasks
                </div>
              </div>

              <div className="w-28">
                <Progress
                  value={
                    r.totalTasks > 0 ? Math.round((r.completedTasks / r.totalTasks) * 100) : 0
                  }
                />
              </div>
            </li>
          ))
        ) : (
          <li className="px-3 py-4 text-sm text-muted-foreground">No entries yet.</li>
        )}
      </ul>

      {top3.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          🏆 Congrats to the top performers! Keep pushing for Band&nbsp;9!
        </p>
      )}
    </div>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded bg-border/50">
      <div className="absolute left-0 top-0 h-full bg-primary" style={{ width: `${value}%` }} />
    </div>
  );
}

function Avatar({ name, src }: { name: string; src?: string }) {
  if (src) {
    return (
      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border">
        <Image src={src} alt={name} fill sizes="32px" />
      </div>
    );
  }
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      aria-label={name}
      className="grid h-8 w-8 place-items-center rounded-full border border-border bg-background text-xs text-muted-foreground"
    >
      {initials || "U"}
    </div>
  );
}
