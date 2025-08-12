// lib/answers.ts
export const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g,' ');
export function isCorrect(user: string, correct: string|string[]) {
  const answers = Array.isArray(correct) ? correct : [correct];
  return answers.some(a => norm(a) === norm(user || ''));
}
export function diffWords(user: string, correct: string) {
  const u = norm(user || '').split(' ').filter(Boolean);
  const c = norm(correct || '').split(' ').filter(Boolean);
  const out: Array<{t:string; k:'ok'|'miss'|'extra'}> = [];
  let ui=0, ci=0;
  while (ui<u.length || ci<c.length) {
    if (u[ui] && u[ui] === c[ci]) { out.push({ t:u[ui], k:'ok' }); ui++; ci++; }
    else if (u[ui] && !c.includes(u[ui])) { out.push({ t:u[ui], k:'extra' }); ui++; }
    else { out.push({ t:c[ci] || '', k:'miss' }); ci++; }
  }
  return out.filter(x=>x.t);
}
