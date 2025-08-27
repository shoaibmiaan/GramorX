// components/speaking/MinimalPairs.tsx
import React from 'react';

export type MinimalPairsProps = {
  pairs: [string, string][];
};

export const MinimalPairs: React.FC<MinimalPairsProps> = ({ pairs }) => {
  if (!pairs?.length) return null;
  return (
    <ul className="grid gap-2">
      {pairs.map(([a, b], idx) => (
        <li key={idx} className="flex items-center gap-2">
          <span className="font-medium">{a}</span>
          <span className="opacity-60">/</span>
          <span className="font-medium">{b}</span>
        </li>
      ))}
    </ul>
  );
};

export default MinimalPairs;
