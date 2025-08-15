export type SpeakingPrompts = { p1: string; p2: string; p3: string };

const P1 = [
  "Describe your hometown. What do you like about it?",
  "Do you prefer mornings or evenings? Why?",
  "What do you usually do on weekends?"
];

const P2 = [
  "Describe a book that changed your perspective. You should say: what it is, how you found it, why it changed you.",
  "Describe a memorable journey. You should say: where you went, who you went with, what happened.",
  "Describe a teacher who influenced you. You should say: who, how they taught, why they're memorable."
];

const P3 = [
  "How important is reading in the digital age?",
  "Should public transport be free? Discuss advantages and disadvantages.",
  "How can cities balance development with preserving history?"
];

export function randomPrompts(): SpeakingPrompts {
  const r = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  return { p1: r(P1), p2: r(P2), p3: r(P3) };
}
