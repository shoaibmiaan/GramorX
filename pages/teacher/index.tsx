// pages/teacher/index.tsx
import * as React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Container } from "@/components/design-system/Container";
import { Button } from "@/components/design-system/Button";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Cohort = {
  id: string;
  teacher_id: string;
  name: string;
  created_at: string;
};

type TabKey = "overview" | "cohorts" | "assignments" | "nudges";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "cohorts", label: "Cohorts" },
  { key: "assignments", label: "Assignments" },
  { key: "nudges", label: "Nudges" },
];

const SectionCard: React.FC<
  React.PropsWithChildren<{ title: string; subtle?: string; className?: string }>
> = ({ title, subtle, className = "", children }) => (
  <Container surface="card" elevation rounded="ds-2xl" className={`p-5 ${className}`}>
    <div className="mb-3 flex items-start justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtle ? <span className="text-sm text-mutedText">{subtle}</span> : null}
    </div>
    {children}
  </Container>
);

export default function TeacherHome() {
  const router = useRouter();
  const qTab = (router.query.tab as TabKey) || "overview";

  const [active, setActive] = React.useState<TabKey>(qTab);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [cohorts, setCohorts] = React.useState<Cohort[]>([]);
  const [newName, setNewName] = React.useState("");

  // Keep `?tab=` in URL
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", active);
    window.history.replaceState({}, "", url.toString());
  }, [active]);

  // Load cohorts
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

      const { data, error: sError } = await supabaseBrowser
        .from("teacher_cohorts")
        .insert({ name: newName.trim() })
        .select("*")
        .single();

      if (sError) throw new Error(sError.message);

      setCohorts((prev) => [data as Cohort, ...prev]);
      setNewName("");
      setActive("cohorts");
    } catch (e: any) {
      setError(e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Cohorts", value: cohorts.length },
    { label: "Pending Reviews", value: 9 },
    { label: "On-time Submissions", value: "92%" },
    { label: "AI Feedback Used", value: "76%" },
  ] as const;

  return (
    <>
      <Head>
        <title>Teacher · GramorX</title>
        <meta name="description" content="Assign tasks, manage cohorts, and nudge students." />
      </Head>

      <section className="bg-background text-foreground">
        <Container width="xl" gutter="md" py="lg">
          {/* Header */}
          <header className="mb-6 md:mb-8">
            <span className="inline-block rounded-full border border-border bg-card/60 px-3 py-1 text-xs">
              Teacher Console
            </span>
            <h1 className="mt-3 bg-gradient-to-r from-vibrantPurple via-electricBlue to-neonGreen bg-clip-text text-3xl font-bold leading-tight text-transparent md:text-4xl">
              Welcome back, Teacher 👋
            </h1>
            <p className="mt-2 text-mutedText">
              Create cohorts, assign IELTS tasks, track progress, and nudge students to higher bands.
            </p>

            {/* Tabs */}
            <nav className="mt-6 flex flex-wrap gap-2">
              {TABS.map((t) => {
                const activeTab = active === t.key;
                return (
                  <Button
                    key={t.key}
                    variant={activeTab ? "primary" : "soft"}
                    tone="primary"
                    size="sm"
                    shape="rounded"
                    onClick={() => setActive(t.key)}
                  >
                    {t.label}
                  </Button>
                );
              })}
            </nav>
          </header>

          {/* Error */}
          {error && (
            <Container surface="muted" rounded="ds" className="mb-6 p-4">
              <div className="text-sunsetRed">⚠️ {error}</div>
            </Container>
          )}

          {/* ===== OVERVIEW ===== */}
          {active === "overview" && (
            <div className="grid gap-6 md:grid-cols-3">
              {/* Left */}
              <div className="space-y-6 md:col-span-2">
                <SectionCard title="Today’s Snapshot" subtle="Live · last 5 min">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {stats.map((s) => (
                      <div
                        key={s.label}
                        className="rounded-ds border border-border bg-background/60 p-4 text-center"
                      >
                        <div className="text-2xl font-bold">{s.value}</div>
                        <div className="mt-1 text-xs text-mutedText">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Quick Actions">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Button href="/teacher?tab=cohorts" className="w-full" size="sm" shape="rounded">
                      View Cohorts
                    </Button>
                    <Button
                      href="/teacher?tab=assignments"
                      variant="accent"
                      className="w-full"
                      size="sm"
                      shape="rounded"
                    >
                      Assign Task
                    </Button>
                    <Button
                      href="/teacher?tab=nudges"
                      variant="secondary"
                      className="w-full"
                      size="sm"
                      shape="rounded"
                    >
                      Send Nudge
                    </Button>
                    <Button href="/progress" variant="ghost" className="w-full" size="sm" shape="rounded">
                      Open Reports
                    </Button>
                    <Button href="/reading" variant="ghost" className="w-full" size="sm" shape="rounded">
                      Reading Drill
                    </Button>
                    <Button href="/writing" variant="ghost" className="w-full" size="sm" shape="rounded">
                      Writing Task Bank
                    </Button>
                  </div>
                </SectionCard>

                <SectionCard title="Recent Activity">
                  <ul className="divide-y divide-border">
                    {[
                      { who: "Cohort A", what: "12 submissions (Writing Task 2)", when: "8m ago" },
                      { who: "Cohort B", what: "3 late homework nudged", when: "19m ago" },
                      { who: "Cohort C", what: "Listening Mock #1 started by 15", when: "1h ago" },
                    ].map((r, i) => (
                      <li key={i} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                            Live
                          </span>
                          <span className="font-medium">{r.who}</span>
                          <span className="text-mutedText">— {r.what}</span>
                        </div>
                        <span className="text-xs text-mutedText">{r.when}</span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              </div>

              {/* Right */}
              <div className="space-y-6">
                <SectionCard title="AI Suggestions" subtle="Personalized">
                  <ol className="ml-5 list-decimal space-y-3">
                    <li>
                      Cohort B struggled with <span className="font-medium">Matching Headings</span>. Assign a targeted
                      Reading set.{" "}
                      <Button variant="link" href="/reading">
                        Open Reading
                      </Button>
                    </li>
                    <li>
                      7 students near band 6.0 — schedule a <span className="font-medium">Speaking P2</span> drill for
                      fluency.{" "}
                      <Button variant="link" href="/speaking/simulator">
                        Start Speaking
                      </Button>
                    </li>
                    <li>
                      4 overdue essays — send a gentle nudge with model answers.{" "}
                      <Button variant="link" href="/teacher?tab=nudges">
                        Compose Nudge
                      </Button>
                    </li>
                  </ol>
                </SectionCard>

                <SectionCard title="Deep Links">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <Button variant="link" href="/dashboard">
                      /dashboard
                    </Button>
                    <Button variant="link" href="/listening">
                      /listening
                    </Button>
                    <Button variant="link" href="/reading">
                      /reading
                    </Button>
                    <Button variant="link" href="/writing">
                      /writing
                    </Button>
                    <Button variant="link" href="/speaking/simulator">
                      /speaking/simulator
                    </Button>
                    <Button variant="link" href="/progress">
                      /progress
                    </Button>
                    <Button variant="link" href="/pricing">
                      /pricing
                    </Button>
                  </div>
                </SectionCard>
              </div>
            </div>
          )}

          {/* ===== COHORTS ===== */}
          {active === "cohorts" && (
            <div className="space-y-6">
              <SectionCard title="Create Cohort" subtle="RLS: teacher-owned">
                <form onSubmit={createCohort} className="grid w-full gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Alpha Academy — Batch A"
                    className="w-full rounded-ds border border-border bg-background px-3 py-2 text-sm outline-none ring-border focus:ring-2"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    shape="rounded"
                    className="md:w-auto"
                    loading={loading}
                    loadingText="Creating…"
                  >
                    + Create cohort
                  </Button>
                </form>
              </SectionCard>

              <SectionCard title="Your Cohorts" subtle={loading ? "Loading…" : `${cohorts.length} total`}>
                <ul className="overflow-hidden rounded-ds border border-border bg-card">
                  {loading && !cohorts.length
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <li key={i} className="px-4 py-3">
                          <div className="h-4 w-48 animate-pulse rounded bg-border" />
                        </li>
                      ))
                    : cohorts.length
                    ? cohorts.map((c) => (
                        <li key={c.id} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0">
                          <div>
                            <div className="text-sm">{c.name}</div>
                            <div className="text-xs text-mutedText">
                              Created {new Date(c.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <Button href={`/teacher/cohorts/${c.id}`} variant="outline" size="sm" shape="rounded">
                            Open
                          </Button>
                        </li>
                      ))
                    : (
                      <li className="px-4 py-4 text-sm text-mutedText">No cohorts yet.</li>
                    )}
                </ul>
              </SectionCard>
            </div>
          )}

          {/* ===== ASSIGNMENTS ===== */}
          {active === "assignments" && (
            <div className="space-y-6">
              <SectionCard title="Assign a Task" subtle="IELTS four modules">
                <form
                  className="grid gap-4 md:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Assignment created (demo) — wire to API next.");
                  }}
                >
                  <label className="flex flex-col gap-2">
                    <span className="text-sm">Cohort</span>
                    <select className="rounded-ds border border-border bg-background p-2">
                      <option value="">Select cohort</option>
                      {cohorts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm">Module</span>
                    <select className="rounded-ds border border-border bg-background p-2">
                      <option>Reading</option>
                      <option>Listening</option>
                      <option>Writing</option>
                      <option>Speaking</option>
                    </select>
                  </label>

                  <label className="md:col-span-2 flex flex-col gap-2">
                    <span className="text-sm">Title</span>
                    <input
                      className="rounded-ds border border-border bg-background p-2"
                      placeholder="e.g., Reading: Matching Headings Set #3"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm">Due Date</span>
                    <input type="date" className="rounded-ds border border-border bg-background p-2" />
                  </label>

                  <label className="md:col-span-2 flex items-center gap-2">
                    <input type="checkbox" className="rounded border-border" defaultChecked />
                    <span className="text-sm">Enable AI feedback on submission</span>
                  </label>

                  <div className="md:col-span-2 flex gap-2">
                    <Button type="submit" size="sm" shape="rounded">
                      Create Assignment
                    </Button>
                    <Button variant="ghost" size="sm" shape="rounded" href="/reading">
                      Preview as Student
                    </Button>
                  </div>
                </form>
              </SectionCard>
            </div>
          )}

          {/* ===== NUDGES ===== */}
          {active === "nudges" && (
            <div className="space-y-6">
              <SectionCard title="Send Nudge" subtle="SMS/WhatsApp/Email (opt-in)">
                <form
                  className="grid gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Nudge queued (demo) — connect Twilio/SMTP next.");
                  }}
                >
                  <label className="flex flex-col gap-2">
                    <span className="text-sm">Audience</span>
                    <select className="rounded-ds border border-border bg-background p-2">
                      <option>Late submissions · Writing T2</option>
                      <option>Low accuracy · T/F/NG</option>
                      <option>Missed last 3 sessions</option>
                      <option>All students in a cohort</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm">Message</span>
                    <textarea
                      rows={4}
                      className="rounded-ds border border-border bg-background p-3"
                      placeholder="Hi team! Quick reminder to finish your Reading Set #3 by tonight. You’ve got this 💪"
                    />
                  </label>

                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" shape="rounded" type="submit">
                      Send Nudge
                    </Button>
                    <Button variant="ghost" size="sm" shape="rounded" type="button">
                      Save as Template
                    </Button>
                  </div>
                </form>
              </SectionCard>
            </div>
          )}

          {/* Utility */}
          <div className="mt-8 flex items-center justify-end">
            <Button href="/challenge" variant="outline" size="sm" shape="rounded">
              Challenges
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
