// types/teacher.ts
// Teacher–cohort management types

export interface TeacherCohort {
  id: string;
  teacherId: string;
  name: string;
  createdAt: string; // ISO timestamp
}

export interface TeacherCohortMember {
  id: string;
  cohortId: string;
  studentId: string;
  joinedAt: string; // ISO timestamp
  progress: Record<string, any>; // flexible per-assignment progress
}

export interface TeacherAssignment {
  id: string;
  cohortId: string;
  title: string;
  description?: string;
  dueDate: string; // ISO date
  createdAt: string;
}

//
// API contracts
//

// Cohorts
export interface TeacherCohortsResponse {
  ok: true;
  cohorts: TeacherCohort[];
} | { ok: false; error: string };

// Cohort members
export interface TeacherCohortMembersResponse {
  ok: true;
  members: TeacherCohortMember[];
} | { ok: false; error: string };

// Assignments
export interface TeacherAssignTaskRequest {
  cohortId: string;
  title: string;
  description?: string;
  dueDate: string;
}
export interface TeacherAssignTaskResponse {
  ok: true;
  assignment: TeacherAssignment;
} | { ok: false; error: string };
