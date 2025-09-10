// pages/challenge/[cohort].tsx
import * as React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Container } from "@/components/design-system/Container";
import { TaskList } from "@/components/challenge/TaskList";
import { Leaderboard } from "@/components/challenge/Leaderboard";
import type { ChallengeTask, ChallengeTaskStatus } from "@/types/challenge";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type EnrollmentLite = {
  id: string;
  progress: Record<string, ChallengeTaskStatus>;
};

function genTasks(startISO: string, days = 14): ChallengeTask[] {
  const base = new Date(startISO);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const day = i + 1;
    const titleMap = [
      "Listening: Section 1 speed read",
      "Reading: TF/NG quick set",
      "Writing: Task-2 intro + thesis",
      "Speaking: Part-1 cadence",
    ];
    return {
      day,
      title: titleMap[i % titleMap.length],
      description: "Auto-generated challenge task",
      dueDate: d.toISOString().slice(0, 10),
      status: "pending",
    };
  });
}

export default function CohortDetailPage() {
  const router = useRouter();
  const cohort = (router.query.cohort as string) || "";

  const [userId, setUserId] = React.useState<string | null>(null);
  const [enrollment, setEnrollment] = React.useState<EnrollmentLite | null>(null);
  const [tasks, setTasks] = React.useState<ChallengeTask[]>([]);
  const [startISO, setStartISO] = React.useState<string>("2025-09-05");

  React.useEffect(() => {
    // derive start date per known cohort id (can come from CMS later)
    if (!cohort) return;
    if (cohort === "BandBoost-Sep2025") setStartISO("2025-09-05");
    else if (cohort === "WritingFocus-Oct2025") setStartISO("2025-10-01");
    else if (cohort === "SpeakingFluency-Oct2025") setStartISO("2025-10-10");
    else setStartISO(new Date().toISOString().slice(0, 10)); // fallback today
  }, [cohort]);

  React.useEffect(() => {
    setTasks(genTasks(startISO, 14));
  }, [startISO]);

  React.useEffect(() => {
    (async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);

      if (!uid || !cohort) return;

      // fetch enrollment for this cohort
      const { data: row } = await supabaseBrowser
        .from("challenge_enrollments")
        .select("id, progress")
        .eq("user_id", uid)
        .eq("cohort", cohort)
        .single();

      if (row) {
        setEnrollment({
          id: (row as any).id,
          progress: ((row as any).progress ?? {}) as Record<string, ChallengeTaskStatus>,
        });
      } else {
        // auto-enroll (optional) if user hits deep link
        const res = await fetch("/api/challenge/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cohort }),
        });
        if (res.ok) {
          const { data: fresh } = await supabaseBrowser
            .from("challenge_enrollments")
            .select("id, progress")
            .eq("user_id", uid)
            .eq("cohort", cohort)
            .single();
          if (fresh) {
            setEnrollment({
              id: (fresh as any).id,
              progress: ((fresh as any).progress ?? {}) as Record<string, ChallengeTaskStatus>,
            });
          }
        }
      }
    })();
  }, [cohort]);

  const done =
    enrollment ? Object.values(enrollment.progress || {}).filter((s) => s === "done").length : 0;
  const pct = Math.round((done / tasks.length) * 100);

  return (
    <>
      <Head>
        <title>{cohort ? `${cohort} · Challenge` : "Challenge"} · GramorX</title>
        <meta name="description" content="Daily micro-tasks, progress tracking, and leaderboards." />
      </Head>

      <div className="pb-safe py-6">
        <Container>
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{cohort || "Challenge"}</h1>
              <p className="text-sm text-muted-foreground">
                {tasks.length} tasks • {pct}% complete
              </p>
            </div>
            <nav className="flex items-center gap-3">
              <Link
                href="/challenge"
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
              >
                All Challenges
              </Link>
              <Link
                href="/progress"
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
              >
                Progress
              </Link>
            </nav>
          </header>

          {!userId ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Please{" "}
              <Link href={`/login?next=${encodeURIComponent(router.asPath)}`} className="text-primary underline-offset-2 hover:underline">
                log in
              </Link>{" "}
              to join and track this challenge.
            </div>
          ) : !enrollment ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Preparing your enrollment…
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <TaskList
                  enrollmentId={enrollment.id}
                  tasks={tasks}
                  progress={enrollment.progress}
                  onUpdate={async (day, status) => {
                    // optimistic update — let TaskList default POST handle network
                    // also refresh local enrollment to keep leaderboard accurate
                    const { data: row } = await supabaseBrowser
                      .from("challenge_enrollments")
                      .select("id, progress")
                      .eq("id", enrollment.id)
                      .single();
                    if (row) {
                      setEnrollment({
                        id: (row as any).id,
                        progress: ((row as any).progress ?? {}) as Record<string, ChallengeTaskStatus>,
                      });
                    }
                  }}
                />
              </div>

              <aside className="lg:col-span-2">
                <Leaderboard cohortId={cohort} />
                <div className="mt-4 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
                  Tip: finish today’s task first — momentum is everything. Need help? Try{" "}
                  <Link href="/ai?sidebar=1" className="text-primary underline-offset-2 hover:underline">
                    AI Sidebar
                  </Link>
                  .
                </div>
              </aside>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}
