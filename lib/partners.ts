// lib/partners.ts
export type RedemptionRow = Readonly<{ code: string; user_id?: string | null; status: 'pending' | 'approved' | 'rejected' }>;

export type PartnerCodeRow = Readonly<{ code: string; approved: number; pending: number }>;

export type PartnerSummary = Readonly<{
  totalClicks: number;
  totalSignups: number;
  totalApproved: number;
  topCodes: PartnerCodeRow[];
}>;

/** Aggregate a list of redemptions into the PartnerSummary used by the API/UI. */
export function buildPartnerSummary(redemptions: RedemptionRow[], totalClicks = 0): PartnerSummary {
  const map = new Map<string, { approved: number; pending: number; users: Set<string> }>();

  for (const r of redemptions) {
    const m = map.get(r.code) ?? { approved: 0, pending: 0, users: new Set<string>() };
    if (r.status === 'approved') m.approved += 1;
    if (r.status === 'pending') m.pending += 1;
    if (r.user_id) m.users.add(r.user_id);
    map.set(r.code, m);
  }

  let totalApproved = 0;
  let totalSignups = 0;
  const topCodes: PartnerCodeRow[] = [];

  for (const [code, m] of map.entries()) {
    totalApproved += m.approved;
    totalSignups += m.users.size;
    topCodes.push({ code, approved: m.approved, pending: m.pending });
  }

  topCodes.sort((a, b) => b.approved - a.approved);

  return { totalClicks, totalSignups, totalApproved, topCodes };
}
