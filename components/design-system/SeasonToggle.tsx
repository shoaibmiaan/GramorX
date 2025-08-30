import React, { useEffect, useState } from 'react';

const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
type Season = typeof SEASONS[number];

export function SeasonToggle() {
  const [season, setSeason] = useState<Season>(() => {
    if (typeof window === 'undefined') return 'spring';
    return (localStorage.getItem('season') as Season) || 'spring';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-season', season);
    try { localStorage.setItem('season', season); } catch {}
  }, [season]);

  const next = () => {
    const idx = SEASONS.indexOf(season);
    setSeason(SEASONS[(idx + 1) % SEASONS.length]);
  };

  return (
    <button
      type="button"
      onClick={next}
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
      aria-label="Toggle seasonal theme"
    >
      <span className="capitalize">{season}</span>
    </button>
  );
}
