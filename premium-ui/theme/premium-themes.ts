export const PREMIUM_THEMES = [
  { id: 'carbon', label: 'Carbon Noir' },
  { id: 'ivory', label: 'Ivory Quartz' },
  { id: 'royal', label: 'Royal Aster' },
  { id: 'aurora', label: 'Aurora Neo' },
] as const;

export type PremiumThemeId = typeof PREMIUM_THEMES[number]['id'];

