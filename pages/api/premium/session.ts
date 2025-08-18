import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { clear } = (req.body ?? {}) as { clear?: boolean };

  const maxAge = clear ? 0 : 60 * 60 * 12; // 12 hours
  // Scoped for whole site so middleware can read it
  const cookie = [
    `pr_access=${clear ? "" : "1"}`,
    `Path=/`,
    `Max-Age=${maxAge}`,
    `SameSite=Lax`,
    `HttpOnly`,
    `Secure`,
  ].join("; ");

  res.setHeader("Set-Cookie", cookie);
  res.status(200).json({ ok: true });
}
