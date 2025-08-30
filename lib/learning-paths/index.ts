export type PathNode = { slug: string; prerequisites?: string[] };

const STORAGE_KEY = 'gx.completedLessons';

export function getCompleted(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function markCompleted(slug: string): string[] {
  const current = getCompleted();
  if (!current.includes(slug) && typeof window !== 'undefined') {
    const next = [...current, slug];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }
  return current;
}

export function isUnlocked(completed: string[], node: PathNode): boolean {
  return (node.prerequisites || []).every((p) => completed.includes(p));
}
