// lib/challenge.ts
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import {
  ChallengeEnrollment,
  ChallengeEnrollRequest,
  ChallengeEnrollResponse,
  ChallengeProgressUpdateRequest,
  ChallengeProgressResponse,
  ChallengeLeaderboardEntry,
  ChallengeLeaderboardResponse,
  ChallengeCohortId,
  ChallengeProgress,
} from "@/types/challenge";

/**
 * Enroll a user into a challenge cohort.
 */
export async function enrollInChallenge(
  userId: string,
  payload: ChallengeEnrollRequest
): Promise<ChallengeEnrollResponse> {
  const { data, error } = await supabaseBrowser
    .from("challenge_enrollments")
    .insert({
      user_id: userId,
      cohort: payload.cohort,
    })
    .select("*")
    .single();

  if (error) return { ok: false, error: error.message };

  const enrollment: ChallengeEnrollment = {
    id: data.id,
    userId: data.user_id,
    cohort: data.cohort,
    enrolledAt: data.enrolled_at,
    progress: data.progress || {},
    completed: data.completed,
    certificateId: data.certificate_id ?? undefined,
  };

  return { ok: true, enrollment };
}

/**
 * Update challenge progress for a specific day.
 */
export async function updateChallengeProgress(
  userId: string,
  payload: ChallengeProgressUpdateRequest
): Promise<ChallengeProgressResponse> {
  // Fetch enrollment first
  const { data: enrollment, error: fetchErr } = await supabaseBrowser
    .from("challenge_enrollments")
    .select("id, progress")
    .eq("id", payload.enrollmentId)
    .eq("user_id", userId)
    .single();

  if (fetchErr || !enrollment) {
    return { ok: false, error: fetchErr?.message || "Enrollment not found" };
  }

  // Update JSONB progress
  const updatedProgress: ChallengeProgress = {
    ...enrollment.progress,
    [`day${payload.day}`]: payload.status,
  };

  const { error: updateErr } = await supabaseBrowser
    .from("challenge_enrollments")
    .update({ progress: updatedProgress })
    .eq("id", payload.enrollmentId)
    .eq("user_id", userId);

  if (updateErr) return { ok: false, error: updateErr.message };

  return { ok: true, progress: updatedProgress };
}

/**
 * Fetch leaderboard for a cohort.
 */
export async function getChallengeLeaderboard(
  cohort: ChallengeCohortId
): Promise<ChallengeLeaderboardResponse> {
  const { data, error } = await supabaseBrowser
    .from("challenge_enrollments")
    .select("user_id, progress, profiles(full_name, avatar_url)")
    .eq("cohort", cohort);

  if (error) return { ok: false, error: error.message };

  const leaderboard: ChallengeLeaderboardEntry[] = (data ?? []).map(
    (row: any, idx: number) => {
      const progress: ChallengeProgress = row.progress || {};
      const completedTasks = Object.values(progress).filter(
        (s) => s === "done"
      ).length;
      const totalTasks = Object.keys(progress).length || 14; // assume 14-day challenge
      return {
        userId: row.user_id,
        fullName: row.profiles?.full_name || "Anonymous",
        avatarUrl: row.profiles?.avatar_url || undefined,
        completedTasks,
        totalTasks,
        rank: idx + 1,
      };
    }
  );

  // Sort by completed tasks desc
  leaderboard.sort((a, b) => b.completedTasks - a.completedTasks);

  // Reassign ranks after sorting
  leaderboard.forEach((entry, i) => (entry.rank = i + 1));

  return { ok: true, cohort, leaderboard };
}

/**
 * Mark enrollment as completed and attach certificate.
 */
export async function completeChallenge(
  enrollmentId: string,
  certificateId: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseBrowser
    .from("challenge_enrollments")
    .update({ completed: true, certificate_id: certificateId })
    .eq("id", enrollmentId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
