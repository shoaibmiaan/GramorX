// pages/api/teacher/assignments.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { assignTask } from "@/lib/teacher";
import { TeacherAssignTaskRequest, TeacherAssignTaskResponse } from "@/types/teacher";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TeacherAssignTaskResponse>
) {
  if (req.method !== "POST") return res.status(405).end();

  const payload = req.body as TeacherAssignTaskRequest;

  const {
    data: { user },
  } = await supabaseBrowser.auth.getUser();

  if (!user) return res.status(401).json({ ok: false, error: "Unauthorized" });

  const result = await assignTask(user.id, payload);
  res.status(result.ok ? 200 : 400).json(result);
}
