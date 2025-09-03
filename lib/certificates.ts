// lib/certificates.ts
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import {
  Certificate,
  CertificateCreateRequest,
  CertificateCreateResponse,
  CertificateSignRequest,
  CertificateSignResponse,
} from "@/types/certificates";

/**
 * Create a certificate for a finished challenge enrollment.
 */
export async function createCertificate(
  userId: string,
  payload: CertificateCreateRequest
): Promise<CertificateCreateResponse> {
  const { data, error } = await supabaseBrowser
    .from("certificates")
    .insert({
      user_id: userId,
      enrollment_id: payload.enrollmentId,
      meta_json: { band: payload.band },
    })
    .select("*")
    .single();

  if (error) return { ok: false, error: error.message };

  const cert: Certificate = {
    id: data.id,
    userId: data.user_id,
    enrollmentId: data.enrollment_id,
    imageUrl: data.image_url ?? "",
    meta: data.meta_json ?? {},
    createdAt: data.created_at,
  };

  return { ok: true, certificate: cert };
}

/**
 * Sign a certificate (e.g. generate signed CDN URL).
 */
export async function signCertificate(
  payload: CertificateSignRequest
): Promise<CertificateSignResponse> {
  const { data, error } = await supabaseBrowser
    .from("certificates")
    .select("id, image_url")
    .eq("id", payload.certId)
    .single();

  if (error || !data)
    return { ok: false, error: error?.message || "Certificate not found" };

  // TODO: integrate Supabase storage signed URL
  const signedUrl = data.image_url;

  return { ok: true, signedUrl };
}

/**
 * Fetch all certificates for a user.
 */
export async function getUserCertificates(
  userId: string
): Promise<Certificate[]> {
  const { data, error } = await supabaseBrowser
    .from("certificates")
    .select("*")
    .eq("user_id", userId);

  if (error) return [];

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    enrollmentId: row.enrollment_id,
    imageUrl: row.image_url ?? "",
    meta: row.meta_json ?? {},
    createdAt: row.created_at,
  }));
}
