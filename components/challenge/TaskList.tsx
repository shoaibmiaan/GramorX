// components/challenge/TaskList.tsx
import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import type { ChallengeProgress, ChallengeTask, ChallengeTaskStatus } from "@/types/challenge";

export type TaskListProps = {
  enrollmentId: string;
  tasks: ReadonlyArray<ChallengeTask>;
  /** Current JSONB progress { day1: "done"|"pending"|"skipped" } */
  progress: ChallengeProgress;
  /** Optional: provide your own updater; if absent, will POST to /api/challenge/progress */
  onUpdate?: (day: number, status: ChallengeTaskStatus) => Promise<void> | void;
};

export function TaskList({ enrollmentId, tasks, progress, onUpdate }: TaskListProps) {
  const [local, setLocal] = useState<ChallengeProgress>(progress);
  const [busyDay, setBusyDay] = useState<number | null>(null);

  const statusFor = useCallback(
    (day: number): ChallengeTaskStatus => (local[`day${day}`] as ChallengeTaskStatus) ?? "pending",
    [local]
  );

  const setStatus = useCallback(
    async (day: number, status: ChallengeTaskStatus) => {
      const key = `day${day}`;
      const optimistic = { ...local, [key]: status };
      setLocal(optimistic);
      setBusyDay(day);

      try {
        if (onUpdate) {
          await onUpdate(day, status);
        } else {
          const res = await fetch("/api/challenge/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enrollmentId, day, status }),
          });
          if (!res.ok) throw new Error("Failed to update progress");
        }
      } catch (e) {
        // roll back on failure
        setLocal((prev) => ({ ...prev, [key]: local[key] }));
        console.error(e);
      } finally {
        setBusyDay(null);
      }
    },
    [enrollmentId, local, onUpdate]
  );

  const completed = useMemo(
    () => tasks.filter((t) => statusFor(t.day) === "done").length,
    [tasks, statusFor]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Daily Tasks</h4>
        <span className="text-xs text-muted-foreground">
          {completed}/{tasks.length} done
        </span>
      </div>

      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {tasks.map((t) => {
          const st = statusFor(t.day);
          const isBusy = busyDay === t.day;

          return (
            <li key={t.day} className="flex items-center gap-3 px-3 py-2">
              <span className="grid h-7 w-7 place-items-center rounded-md border border-border text-xs text-muted-foreground">
                {t.day}
              </span>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-foreground">{t.title}</div>
                <div className="text-xs text-muted-foreground">
                  Due {new Date(t.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isBusy || st === "done"}
                  onClick={() => setStatus(t.day, "done")}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-border/30 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-pressed={st === "done"}
                >
                  {isBusy && st !== "done" ? "…" : "Mark done"}
                </button>
                <button
                  type="button"
                  disabled={isBusy || st === "skipped"}
                  onClick={() => setStatus(t.day, "skipped")}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-border/30 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-pressed={st === "skipped"}
                >
                  Skip
                </button>
                <button
                  type="button"
                  disabled={isBusy || st === "pending"}
                  onClick={() => setStatus(t.day, "pending")}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-border/30 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-pressed={st === "pending"}
                >
                  Reset
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
