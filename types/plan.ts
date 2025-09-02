// types/plan.ts
import { z } from 'zod';

export type TaskType =
  | 'listening'
  | 'reading'
  | 'writing'
  | 'speaking'
  | 'vocab'
  | 'review'
  | 'mock'
  | 'rest';

export const StudyTaskSchema = z.object({
  id: z.string(),
  type: z.custom<TaskType>((v) =>
    ['listening', 'reading', 'writing', 'speaking', 'vocab', 'review', 'mock', 'rest'].includes(
      v as string
    )
  ),
  title: z.string(),
  estMinutes: z.number().int().positive().max(240),
  resourceId: z.string().optional(), // paper/test/prompt id
  dueISO: z.string().datetime().optional(),
  completed: z.boolean().default(false),
});
export type StudyTask = z.infer<typeof StudyTaskSchema>;

export const StudyDaySchema = z.object({
  dateISO: z.string().datetime(), // YYYY-MM-DDT00:00:00Z
  tasks: z.array(StudyTaskSchema),
});
export type StudyDay = z.infer<typeof StudyDaySchema>;

export const StudyPlanSchema = z.object({
  userId: z.string(),
  startISO: z.string().datetime(),
  weeks: z.number().int().positive().max(12).default(4),
  goalBand: z.number().min(4).max(9).optional(),
  weaknesses: z.array(z.string()).optional(),
  days: z.array(StudyDaySchema),
});
export type StudyPlan = z.infer<typeof StudyPlanSchema>;

/** Type guard helper for reading JSON from DB (study_plans.plan_json) */
export function isStudyPlan(input: unknown): input is StudyPlan {
  const res = StudyPlanSchema.safeParse(input);
  return res.success;
}
