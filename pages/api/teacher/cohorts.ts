// pages/api/teacher/cohorts.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getTeacherCohorts } from "@/lib/teacher";
import { TeacherCohortsResponse } from "@/types/teacher";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TeacherCohortsResponse>
) {
  if (req.method !== "GET") return res.status(405).end();

  const {
    data: { user },
  } = await supabaseBrowser.auth.getUser();

  if (!user) return res.status(401).json({ ok: false, error: "Unauthorized" });

  const cohorts = await getTeacherCohorts(user.id);
  res.status(200).json({ ok: true, cohorts });
}
