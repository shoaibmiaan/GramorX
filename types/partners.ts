// types/partners.ts
export type PartnerCodeRow = Readonly<{ code: string; approved: number; pending: number }>;

export type PartnerSummary = Readonly<{
  totalClicks: number;
  totalSignups: number;
  totalApproved: number;
  topCodes: PartnerCodeRow[];
}>;

export type PartnerSummaryResponse =
  | Readonly<{ ok: true; summary: PartnerSummary }>
  | Readonly<{ ok: false; error: string }>;
