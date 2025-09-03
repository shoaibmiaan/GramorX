// lib/teacher.ts
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import {
  TeacherCohort,
  TeacherCohortMember,
  TeacherAssignment,
  TeacherAssignTaskRequest,
  TeacherAssignTaskResponse,
} from "@/types/teacher";

/**
 * Fetch cohorts owned by a teacher.
 */
export async function getTeacherCohorts(
  teacherId: string
): Promise<TeacherCohort[]> {
  const { data, error } = await supabaseBrowser
    .from("teacher_cohorts")
    .select("*")
    .eq("teacher_id", teacherId);

  if (error) return [];

  return data.map((row) => ({
    id: row.id,
    teacherId: row.teacher_id,
    name: row.name,
    createdAt: row.created_at,
  }));
}

/**
 * Fetch members of a cohort.
 */
export async function getCohortMembers(
  cohortId: string
): Promise<TeacherCohortMember[]> {
  const { data, error } = await supabaseBrowser
    .from("teacher_cohort_members")
    .select("*")
    .eq("cohort_id", cohortId);

  if (error) return [];

  return data.map((row) => ({
    id: row.id,
    cohortId: row.cohort_id,
    studentId: row.student_id,
    joinedAt: row.joined_at,
    progress: row.progress ?? {},
  }));
}

/**
 * Create an assignment for a cohort.
 */
export async function assignTask(
  teacherId: string,
  payload: TeacherAssignTaskRequest
): Promise<TeacherAssignTaskResponse> {
  const { data, error } = await supabaseBrowser
    .from("teacher_assignments")
    .insert({
      cohort_id: payload.cohortId,
      title: payload.title,
      description: payload.description,
      due_date: payload.dueDate,
      teacher_id: teacherId,
    })
    .select("*")
    .single();

  if (error) return { ok: false, error: error.message };

  const assignment: TeacherAssignment = {
    id: data.id,
    cohortId: data.cohort_id,
    title: data.title,
    description: data.description,
    dueDate: data.due_date,
    createdAt: data.created_at,
  };

  return { ok: true, assignment };
}
