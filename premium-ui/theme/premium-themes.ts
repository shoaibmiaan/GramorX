export const PREMIUM_THEMES = [
  { id: 'carbon', label: 'Carbon Noir', preview: '#1b1b1f' },
  { id: 'ivory', label: 'Ivory Quartz', preview: '#f8f4e7' },
  { id: 'royal', label: 'Royal Aster', preview: '#4c1d95' },
  { id: 'aurora', label: 'Aurora Neo', preview: '#0ea5e9' },
] as const;

export type PremiumThemeId = typeof PREMIUM_THEMES[number]['id'];

