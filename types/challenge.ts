// types/challenge.ts
// Domain types for Challenge enrollment, progress, leaderboard

export type ChallengeCohortId = string; // e.g. "BandBoost-Sept2025"

export type ChallengeTaskStatus = "pending" | "done" | "skipped";

export interface ChallengeTask {
  day: number; // Day 1..14 (or longer)
  title: string;
  description?: string;
  dueDate: string; // ISO date
  status: ChallengeTaskStatus;
}

export interface ChallengeProgress {
  [day: string]: ChallengeTaskStatus;
}

export interface ChallengeEnrollment {
  id: string;
  userId: string;
  cohort: ChallengeCohortId;
  enrolledAt: string; // ISO timestamp
  progress: ChallengeProgress;
  completed: boolean;
  certificateId?: string;
}

export interface ChallengeLeaderboardEntry {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  completedTasks: number;
  totalTasks: number;
  rank: number;
  bandBoost?: number; // optional AI-predicted improvement
}

export interface ChallengeCohort {
  id: ChallengeCohortId;
  title: string;
  description: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  tasks: ChallengeTask[];
}

//
// API contracts
//

// Enroll
export interface ChallengeEnrollRequest {
  cohort: ChallengeCohortId;
}
export interface ChallengeEnrollResponse {
  ok: true;
  enrollment: ChallengeEnrollment;
} | { ok: false; error: string };

// Progress
export interface ChallengeProgressUpdateRequest {
  enrollmentId: string;
  day: number;
  status: ChallengeTaskStatus;
}
export interface ChallengeProgressResponse {
  ok: true;
  progress: ChallengeProgress;
} | { ok: false; error: string };

// Leaderboard
export interface ChallengeLeaderboardResponse {
  ok: true;
  cohort: ChallengeCohortId;
  leaderboard: ChallengeLeaderboardEntry[];
} | { ok: false; error: string };
