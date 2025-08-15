export const normLetter = (s: any) => String(s ?? '').trim().toUpperCase();

export const normText = (s: any) =>
  String(s ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()"]/g, '');

export const sortPairs = (pairs: [number, number][]) =>
  [...pairs].map(p => [Number(p[0]), Number(p[1])] as [number, number])
  .sort((a,b) => (a[0]-b[0]) || (a[1]-b[1]));
