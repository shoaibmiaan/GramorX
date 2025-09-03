// components/teacher/CohortTable.tsx
import * as React from "react";
import Image from "next/image";
import type { TeacherCohortMember } from "@/types/teacher";

export type CohortRow = TeacherCohortMember & {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  completed?: number;
  total?: number;
};

export type CohortTableProps = {
  rows: ReadonlyArray<CohortRow>;
  onNudge?: (studentId: string) => void | Promise<void>;
  onRemove?: (membershipId: string) => void | Promise<void>;
  sortBy?: "name" | "progress" | "joined";
};

export function CohortTable({ rows, onNudge, onRemove, sortBy = "progress" }: CohortTableProps) {
  const [order, setOrder] = React.useState<"asc" | "desc">("desc");

  const sorted = React.useMemo(() => {
    const list = [...rows];
    const cmp = (a: CohortRow, b: CohortRow) => {
      if (sortBy === "name") {
        return (a.fullName || "").localeCompare(b.fullName || "");
      } else if (sortBy === "joined") {
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      }
      // progress
      const ap = pct(a.completed ?? 0, a.total ?? 0);
      const bp = pct(b.completed ?? 0, b.total ?? 0);
      return ap - bp;
    };
    list.sort(cmp);
    if (order === "desc") list.reverse();
    return list;
  }, [rows, sortBy, order]);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-3 py-2">
        <h4 className="text-sm font-medium text-foreground">Cohort Members</h4>
        <div className="flex items-center gap-2">
          <SortButton active={sortBy === "progress"} onClick={() => setOrder(prev => (prev === "asc" ? "desc" : "asc"))}>
            Progress {order === "asc" ? "↑" : "↓"}
          </SortButton>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-t border-border text-sm">
          <thead className="bg-background/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Student</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Joined</th>
              <th className="px-3 py-2">Progress</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-muted-foreground" colSpan={5}>
                  No students yet.
                </td>
              </tr>
            ) : (
              sorted.map((r) => (
                <tr key={r.id} className="align-middle">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.fullName || r.studentId} src={r.avatarUrl} />
                      <div className="min-w-0">
                        <div className="truncate text-foreground">{r.fullName || "—"}</div>
                        <div className="text-xs text-muted-foreground">{shortId(r.studentId)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{r.email || "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {new Date(r.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-40">
                        <Progress value={pct(r.completed ?? 0, r.total ?? 0)} />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {(r.completed ?? 0)}/{(r.total ?? 0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {onNudge && (
                        <button
                          type="button"
                          onClick={() => onNudge(r.studentId)}
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground hover:bg-border/30"
                        >
                          Nudge
                        </button>
                      )}
                      {onRemove && (
                        <button
                          type="button"
                          onClick={() => onRemove(r.id)}
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-red-400 hover:bg-border/30"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function pct(done: number, total: number) {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 4)}…${id.slice(-4)}` : id;
}

function SortButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2 py-1 text-xs ${
        active
          ? "border-border bg-background text-foreground"
          : "border-border bg-card text-muted-foreground"
      } hover:bg-border/30`}
    >
      {children}
    </button>
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
  const initials = (name || "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="grid h-8 w-8 place-items-center rounded-full border border-border bg-background text-xs text-muted-foreground">
      {initials}
    </div>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded bg-border/50">
      <div
        className="absolute left-0 top-0 h-full bg-primary"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}
