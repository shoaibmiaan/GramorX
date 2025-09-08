// components/speaking/AccentPicker.tsx
import React from 'react';
import { Badge } from '@/components/design-system/Badge';

export type Accent = 'UK' | 'US' | 'AUS';
export const AccentPicker: React.FC<{ value: Accent; onChange: (a: Accent)=>void }> = ({ value, onChange }) => {
  const options: Accent[] = ['UK','US','AUS'];
  return (
    <div className="flex gap-2 items-center">
      <span className="text-small opacity-80">Accent:</span>
      {options.map(o => (
        <button
          key={o}
          onClick={()=>onChange(o)}
          className={`px-3 py-1 rounded-ds border ${o===value ? 'border-primary text-primary' : 'border-white/10 text-muted-foreground'}`}
        >
          <span className="text-small">{o}</span>
        </button>
      ))}
      <Badge variant="info" className="ml-2">Optional</Badge>
    </div>
  );
};
