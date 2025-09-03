// pages/teacher/index.tsx
import * as React from "react";
import Head from "next/head";
import Link from "next/link";
import { Container } from "@/components/design-system/Container";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Cohort = {
  id: string;
  teacher_id: string;
  name: string;
  created_at: string;
};

export default function TeacherHome() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [cohorts, setCohorts] = React.useState<Cohort[]>([]);
  const [newName, setNewName] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/teacher/cohorts");
        if (!res.ok) throw new Error("Failed to load cohorts");
        const j = (await res.json()) as { ok: boolean; cohorts?: Cohort[]; error?: string };
        if (!j.ok || !j.cohorts) throw new Error(j.error || "Unknown error");
        setCohorts(j.cohorts);
      } catch (e: any) {
        setError(e.message ?? "Error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const createCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // RLS lets teacher create their own cohorts
      const { data, error } = await supabaseBrowser
        .from("teacher_cohorts")
        .insert({ name: newName.trim() })
        .select("*")
        .single();

      if (error) throw new Error(error.message);

      setCohorts((prev) => [data as Cohort, ...prev]);
      setNewName("");
    } catch (e: any) {
      setError(e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Teacher · GramorX</title>
        <meta name="description" content="Assign tasks, manage cohorts, and nudge students." />
      </Head>

      <div className="py-6">
        <Container>
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Teacher Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Create cohorts, assign tasks, and track progress.
              </p>
            </div>
            <nav className="flex items-center gap-3">
              <Link
                href="/challenge"
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
              >
                Challenges
              </Link>
            </nav>
          </header>

          <section className="mb-6 rounded-xl border border-border bg-card p-4">
            <form onSubmit={createCohort} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Alpha Academy — Batch A"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="shrink-0 rounded-md border border-border bg-primary px-3 py-2 text-sm text-background hover:opacity-90"
              >
                Create cohort
              </button>
            </form>
            {error && (
              <p className="mt-2 text-xs text-red-400">
                {error}
              </p>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-foreground">Your Cohorts</h2>
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {loading && !cohorts.length ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="px-3 py-3">
                    <div className="h-4 w-48 animate-pulse rounded bg-border" />
                  </li>
                ))
              ) : cohorts.length ? (
                cohorts.map((c) => (
                  <li key={c.id} className="flex items-center justify-between px-3 py-3">
                    <div>
                      <div className="text-sm text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Created {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Link
                      href={`/teacher/cohorts/${c.id}`}
                      className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
                    >
                      Open
                    </Link>
                  </li>
                ))
              ) : (
                <li className="px-3 py-4 text-sm text-muted-foreground">No cohorts yet.</li>
              )}
            </ul>
          </section>
        </Container>
      </div>
    </>
  );
}
