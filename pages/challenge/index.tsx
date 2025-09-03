// pages/challenge/index.tsx
import * as React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { Container } from "@/components/design-system/Container";
import { ChallengeCohortCard } from "@/components/challenge/ChallengeCohortCard";
import type { ChallengeCohortId } from "@/types/challenge";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type UiCohort = {
  id: ChallengeCohortId;
  title: string;
  description: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  totalTasks: number;
};

const COHORTS: UiCohort[] = [
  {
    id: "BandBoost-Sep2025",
    title: "14-Day Band-Boost (Sep 2025)",
    description: "Daily micro-tasks to push Listening & Reading speed.",
    startDate: "2025-09-05",
    endDate: "2025-09-18",
    totalTasks: 14,
  },
  {
    id: "WritingFocus-Oct2025",
    title: "Writing Focus (Oct 2025)",
    description: "Task-2 structure, coherence & lexical range drills.",
    startDate: "2025-10-01",
    endDate: "2025-10-14",
    totalTasks: 14,
  },
  {
    id: "SpeakingFluency-Oct2025",
    title: "Speaking Fluency (Oct 2025)",
    description: "Shadowing, fillers control & pronunciation ladder.",
    startDate: "2025-10-10",
    endDate: "2025-10-23",
    totalTasks: 14,
  },
];

type EnrollmentRow = {
  id: string;
  cohort: string;
  progress: Record<string, "pending" | "done" | "skipped">;
};

export default function ChallengeIndexPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = React.useState<EnrollmentRow[]>([]);
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);

      if (!uid) return;

      const { data: rows } = await supabaseBrowser
        .from("challenge_enrollments")
        .select("id, cohort, progress")
        .eq("user_id", uid);

      setEnrollments((rows as any) ?? []);
    })();
  }, []);

  const enrollmentFor = React.useCallback(
    (cohortId: string) => enrollments.find((e) => e.cohort === cohortId),
    [enrollments]
  );

  const onEnroll = async (cohortId: ChallengeCohortId) => {
    if (!userId) {
      router.push(`/login?next=${encodeURIComponent("/challenge")}`);
      return;
    }
    const res = await fetch("/api/challenge/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cohort: cohortId }),
    });
    if (res.ok) {
      // refresh client enrollments
      const { data } = await supabaseBrowser
        .from("challenge_enrollments")
        .select("id, cohort, progress")
        .eq("user_id", userId);
      setEnrollments((data as any) ?? []);
    } else {
      const j = await res.json().catch(() => ({}));
      alert(j?.error ?? "Failed to enroll");
    }
  };

  return (
    <>
      <Head>
        <title>Challenges · GramorX</title>
        <meta name="description" content="Join a 14-day challenge to raise your IELTS band." />
      </Head>

      <div className="py-6">
        <Container>
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Challenges</h1>
              <p className="text-sm text-muted-foreground">
                Pick a cohort and start your 14-day journey. Track progress & climb the leaderboard.
              </p>
            </div>
            <nav className="flex items-center gap-3">
              <Link
                href="/progress"
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
              >
                Progress & Reports
              </Link>
              <Link
                href="/study-plan"
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
              >
                Study Plan
              </Link>
            </nav>
          </header>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {COHORTS.map((c) => {
              const en = enrollmentFor(c.id);
              const done = en
                ? Object.values(en.progress || {}).filter((s) => s === "done").length
                : 0;
              const pct = Math.round((done / c.totalTasks) * 100);

              return (
                <ChallengeCohortCard
                  key={c.id}
                  id={c.id}
                  title={c.title}
                  description={c.description}
                  startDate={c.startDate}
                  endDate={c.endDate}
                  totalTasks={c.totalTasks}
                  enrolled={!!en}
                  progressPct={pct}
                  onEnroll={onEnroll}
                />
              );
            })}
          </section>

          <div className="mt-6 text-xs text-muted-foreground">
            Deep links:{" "}
            <Link href="/challenge/BandBoost-Sep2025" className="text-primary underline-offset-2 hover:underline">
              /challenge/BandBoost-Sep2025
            </Link>{" "}
            ·{" "}
            <Link href="/progress" className="text-primary underline-offset-2 hover:underline">
              /progress
            </Link>{" "}
            ·{" "}
            <Link href="/ai?sidebar=1" className="text-primary underline-offset-2 hover:underline">
              /ai?sidebar=1
            </Link>
          </div>
        </Container>
      </div>
    </>
  );
}
