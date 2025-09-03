// pages/teacher/cohorts/[id].tsx
import * as React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Container } from "@/components/design-system/Container";
import { CohortTable, type CohortRow } from "@/components/teacher/CohortTable";
import { AssignTaskModal } from "@/components/teacher/AssignTaskModal";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Cohort = { id: string; name: string; created_at: string };

export default function CohortDetail() {
  const router = useRouter();
  const cohortId = (router.query.id as string) || "";

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [cohort, setCohort] = React.useState<Cohort | null>(null);
  const [rows, setRows] = React.useState<CohortRow[]>([]);
  const [assignOpen, setAssignOpen] = React.useState(false);

  const refresh = React.useCallback(async () => {
    if (!cohortId) return;
    try {
      setLoading(true);
      setError(null);

      // Load cohort shell (enforced by RLS: must be teacher's cohort)
      const { data: cRow, error: e1 } = await supabaseBrowser
        .from("teacher_cohorts")
        .select("*")
        .eq("id", cohortId)
        .single();

      if (e1 || !cRow) throw new Error(e1?.message || "Cohort not found");
      setCohort(cRow as Cohort);

      // Load members with profile info if available
      const { data: members, error: e2 } = await supabaseBrowser
        .from("teacher_cohort_members")
        .select("id, cohort_id, student_id, joined_at, progress, profiles(full_name, email, avatar_url)")
        .eq("cohort_id", cohortId);

      if (e2) throw new Error(e2.message);

      const normalized: CohortRow[] = (members as any[]).map((m) => {
        const prog = m.progress || {};
        // crude completion: count truthy "done" values
        const completed = Object.values(prog).filter((v: any) => v === "done" || v === true).length;
        const total = Math.max(completed, 14); // assume 14-day track; adjust when real tasks exist
        return {
          id: m.id,
          cohortId: m.cohort_id,
          studentId: m.student_id,
          joinedAt: m.joined_at,
          progress: prog,
          fullName: m.profiles?.full_name ?? "Student",
          email: m.profiles?.email ?? undefined,
          avatarUrl: m.profiles?.avatar_url ?? undefined,
          completed,
          total,
        };
      });

      setRows(normalized);
    } catch (e: any) {
      setError(e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }, [cohortId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const onNudge = async (studentId: string) => {
    const message = `Reminder: Please complete today's challenge task for cohort ${cohort?.name}.`;
    const res = await fetch("/api/notifications/nudge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: studentId, message }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j?.error ?? "Failed to send nudge");
    } else {
      alert("Nudge sent!");
    }
  };

  const onRemove = async (membershipId: string) => {
    // RLS delete policy not defined earlier; may fail until policy is added.
    const { error } = await supabaseBrowser
      .from("teacher_cohort_members")
      .delete()
      .eq("id", membershipId);
    if (error) {
      alert(error.message);
    } else {
      setRows((prev) => prev.filter((r) => r.id !== membershipId));
    }
  };

  return (
    <>
      <Head>
        <title>{cohort ? `${cohort.name} · Cohort` : "Cohort"} · GramorX</title>
        <meta name="description" content="Manage cohort members and assignments." />
      </Head>

      <div className="py-6">
        <Container>
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {cohort?.name || "Cohort"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Track member progress and assign tasks.
              </p>
            </div>
            <nav className="flex items-center gap-3">
              <Link
                href="/teacher"
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
              >
                All Cohorts
              </Link>
              <button
                type="button"
                onClick={() => setAssignOpen(true)}
                className="rounded-md border border-border bg-primary px-3 py-1.5 text-sm text-background hover:opacity-90"
              >
                Assign task
              </button>
            </nav>
          </header>

          {loading ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Loading cohort…
            </div>
          ) : error ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-red-400">
              {error}
            </div>
          ) : !cohort ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Cohort not found.
            </div>
          ) : (
            <CohortTable rows={rows} onNudge={onNudge} onRemove={onRemove} />
          )}
        </Container>
      </div>

      <AssignTaskModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        cohortId={cohortId}
        onSubmit={async (data) => {
          // Uses API route which expects teacher_assignments table. If missing, backend will return error.
          const res = await fetch("/api/teacher/assignments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            alert(j?.error ?? "Failed to assign task");
          } else {
            setAssignOpen(false);
            alert("Task assigned");
          }
        }}
      />
    </>
  );
}
