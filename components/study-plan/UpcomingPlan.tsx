import React from 'react';
import { Card } from '@/components/design-system/Card';
import type { DayPlan } from '@/lib/studyPlan';

interface Props {
  days: DayPlan[];
}

export const UpcomingPlan: React.FC<Props> = ({ days }) => (
  <Card className="p-6 rounded-ds-2xl">
    <h3 className="font-slab text-h3 mb-4">Next 7 Days</h3>
    <ul className="space-y-2">
      {days.map((d) => (
        <li key={d.date} className="flex items-center justify-between">
          <span>{new Date(d.date).toLocaleDateString()}</span>
          <span className="font-semibold">{d.target} tasks</span>
        </li>
      ))}
    </ul>
  </Card>
);

export default UpcomingPlan;
