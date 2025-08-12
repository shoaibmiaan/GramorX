export const isUnlocked = (userProgressPercent: number, requiredPercent: number) =>
  userProgressPercent >= requiredPercent;
