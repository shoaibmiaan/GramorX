import { useState } from 'react';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

export default function DeviceCheck() {
  const [status, setStatus] = useState<string | null>(null);

  const checkMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus('Microphone access granted.');
    } catch (err) {
      setStatus('Microphone access denied.');
    }
  };

  return (
    <Card className="card-surface p-6 rounded-ds-2xl mb-6">
      <h2 className="font-slab text-h2 mb-2">Device &amp; Mic Check</h2>
      <p className="mb-4 text-grayish">Ensure your microphone works before the exam.</p>
      <Button onClick={checkMic} variant="primary" className="mb-3">
        Check Microphone
      </Button>
      {status && <p className="text-small">{status}</p>}
    </Card>
  );
}
