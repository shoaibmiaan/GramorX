import { useState } from 'react';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { Timer } from '@/components/design-system/Timer';

export default function TimingRehearsal() {
  const [minutes, setMinutes] = useState(2);
  const [running, setRunning] = useState(false);
  const [startSec, setStartSec] = useState(120);

  const startTimer = async () => {
    const m = Math.max(1, minutes);
    setStartSec(m * 60);
    setRunning(true);
    try {
      await fetch('/api/exam/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: m }),
      });
    } catch (e) {
      // ignore network errors
    }
  };

  return (
    <Card className="card-surface p-6 rounded-ds-2xl mb-6">
      <h2 className="font-slab text-h2 mb-2">Timing Rehearsal</h2>
      <p className="mb-4 text-grayish">Practice with a countdown timer to simulate exam pressure.</p>
      <div className="flex items-end gap-3 mb-4">
        <Input
          type="number"
          label="Minutes"
          value={minutes}
          min={1}
          onChange={(e) => setMinutes(parseInt(e.target.value || '1', 10))}
          className="w-24"
        />
        <Button variant="primary" onClick={startTimer} disabled={running}>
          Start
        </Button>
        {running && (
          <Button variant="secondary" onClick={() => setRunning(false)}>
            Stop
          </Button>
        )}
      </div>
      {running && <Timer initialSeconds={startSec} mode="countdown" running={running} onComplete={() => setRunning(false)} />}
    </Card>
  );
}
