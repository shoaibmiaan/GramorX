// pages/api/user/dashboard.ts
import type { NextApiRequest, NextApiResponse } from "next";

type ModuleCard = Readonly<{ id: string; title: string; progress: number }>;
type DashboardPayload = Readonly<{ user: { name: string }; modules: ModuleCard[] }>;

export default function handler(_req: NextApiRequest, res: NextApiResponse<DashboardPayload>) {
  const data: DashboardPayload = {
    user: { name: "Shoaib" },
    modules: [
      { id: "listening", title: "Listening", progress: 42 },
      { id: "reading", title: "Reading", progress: 68 },
      { id: "writing", title: "Writing", progress: 10 },
      { id: "speaking", title: "Speaking", progress: 0 },
    ],
  };
  res.status(200).json(data);
}
