// types/certificates.ts
// Types for certificates issued after challenge completion

export interface CertificateMeta {
  band?: number; // e.g. 7.5
  cohort?: string;
  issuedBy?: string;
  issuedAt?: string; // ISO date
  notes?: string;
}

export interface Certificate {
  id: string;
  userId: string;
  enrollmentId?: string;
  imageUrl: string;
  meta: CertificateMeta;
  createdAt: string; // ISO timestamp
}

//
// API contracts
//

// Create certificate
export interface CertificateCreateRequest {
  enrollmentId: string;
  band: number;
}
export interface CertificateCreateResponse {
  ok: true;
  certificate: Certificate;
} | { ok: false; error: string };

// Sign certificate
export interface CertificateSignRequest {
  certId: string;
}
export interface CertificateSignResponse {
  ok: true;
  signedUrl: string;
} | { ok: false; error: string };
