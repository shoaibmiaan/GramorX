import React from 'react';
import { Card } from '@/components/design-system/Card';

interface Props {
  daily: number;
  weekly: number;
  eta: string | null;
}

export const TargetSummary: React.FC<Props> = ({ daily, weekly, eta }) => (
  <Card className="p-6 rounded-ds-2xl">
    <h3 className="font-slab text-h3 mb-4">Your Targets</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <div>
        <div className="text-sm text-gray-600 dark:text-grayish">Daily</div>
        <div className="text-xl font-semibold">{daily}</div>
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-grayish">Weekly</div>
        <div className="text-xl font-semibold">{weekly}</div>
      </div>
    </div>
    {eta && (
      <p className="text-sm text-gray-600 dark:text-grayish">
        ETA to goal: {new Date(eta).toLocaleDateString()}
      </p>
    )}
  </Card>
);

export default TargetSummary;
