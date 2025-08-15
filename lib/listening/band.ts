// Simple IELTS Listening conversion (Academic/GT commonly align for listening).
// Adjust table to your official mapping if needed.
const TABLE: [number, number][] = [
  [39, 9], [37, 8.5],
  [35, 8], [32, 7.5],
  [30, 7], [26, 6.5],
  [23, 6], [18, 5.5],
  [16, 5], [13, 4.5],
  [11, 4], [8, 3.5],
  [6, 3], [4, 2.5], [0, 0],
];

export function rawToBand(raw: number): number {
  for (const [min, band] of TABLE) if (raw >= min) return band;
  return 0;
}
