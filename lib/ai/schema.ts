export type BandCriterion = { name: string; score: number; tip: string };
export type BandFeedback = { band: number; criteria: BandCriterion[]; summary: string };