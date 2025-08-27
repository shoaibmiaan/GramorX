import React, { useState } from 'react';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { useMood } from '@/hooks/useMood';

export default function MotivationCoach() {
  const { logs, reflection, loading, error, addDaily, addWeekly } = useMood();
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [weeklyText, setWeeklyText] = useState('');

  const avgMood = logs.length ? logs.reduce((a, b) => a + b.mood, 0) / logs.length : null;
  const avgEnergy = logs.length ? logs.reduce((a, b) => a + b.energy, 0) / logs.length : null;

  const submitDaily = async () => {
    try {
      await addDaily(mood, energy);
    } catch (e) {
      console.error(e);
    }
  };

  const submitWeekly = async () => {
    try {
      if (weeklyText.trim()) {
        await addWeekly(weeklyText.trim());
        setWeeklyText('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Card className="p-6 rounded-ds-2xl">
      <h3 className="font-slab text-h3 mb-2">Motivation Coach</h3>
      {loading ? (
        <p className="text-body">Loading...</p>
      ) : error ? (
        <Alert variant="error" className="mt-2">{error}</Alert>
      ) : (
        <>
          {avgMood !== null ? (
            <p className="text-body mb-4">
              Last 7 days avg mood {avgMood.toFixed(1)} / energy {avgEnergy?.toFixed(1)}
            </p>
          ) : (
            <p className="text-body mb-4">No mood entries yet.</p>
          )}
          {reflection ? (
            <p className="text-body mb-4 italic">{reflection.reflection}</p>
          ) : null}
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={1}
                max={10}
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="w-16 border p-1 rounded"
                aria-label="mood"
              />
              <input
                type="number"
                min={1}
                max={10}
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-16 border p-1 rounded"
                aria-label="energy"
              />
              <Button onClick={submitDaily} size="sm" variant="primary" className="rounded-ds-xl">
                Log
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Weekly reflection"
                value={weeklyText}
                onChange={(e) => setWeeklyText(e.target.value)}
                className="flex-1 border p-1 rounded"
              />
              <Button onClick={submitWeekly} size="sm" variant="secondary" className="rounded-ds-xl">
                Save
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
