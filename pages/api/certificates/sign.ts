// pages/api/certificates/sign.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { signCertificate } from "@/lib/certificates";
import { CertificateSignRequest, CertificateSignResponse } from "@/types/certificates";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CertificateSignResponse>
) {
  if (req.method !== "POST") return res.status(405).end();

  const payload = req.body as CertificateSignRequest;

  const result = await signCertificate(payload);
  res.status(result.ok ? 200 : 400).json(result);
}
