// pages/api/certificates/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createCertificate } from "@/lib/certificates";
import { CertificateCreateRequest, CertificateCreateResponse } from "@/types/certificates";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CertificateCreateResponse>
) {
  if (req.method !== "POST") return res.status(405).end();

  const payload = req.body as CertificateCreateRequest;

  const {
    data: { user },
  } = await supabaseBrowser.auth.getUser();

  if (!user) return res.status(401).json({ ok: false, error: "Unauthorized" });

  const result = await createCertificate(user.id, payload);
  res.status(result.ok ? 200 : 400).json(result);
}
