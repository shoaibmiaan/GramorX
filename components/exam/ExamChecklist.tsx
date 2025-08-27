import { useState } from 'react';
import { Card } from '@/components/design-system/Card';
import { Checkbox } from '@/components/design-system/Checkbox';

const items = [
  { id: 'id', label: 'Photo ID ready' },
  { id: 'headphones', label: 'Headphones connected' },
  { id: 'internet', label: 'Stable internet connection' },
];

export default function ExamChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card className="card-surface p-6 rounded-ds-2xl mb-6">
      <h2 className="font-slab text-h2 mb-2">Exam Day Checklist</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <Checkbox
              label={item.label}
              checked={!!checked[item.id]}
              onChange={() => toggle(item.id)}
            />
          </li>
        ))}
      </ul>
    </Card>
  );
}
