import React, { useEffect, useState } from 'react';

import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

interface VisaTarget {
  user_id: string;
  institution: string;
  target_band: number;
  deadline: string | null;
}

export const TargetScoreForm: React.FC = () => {
  const [institution, setInstitution] = useState('');
  const [targetBand, setTargetBand] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();
      if (!user) return;
      const { data } = await supabaseBrowser
        .from<VisaTarget>('visa_targets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setInstitution(data.institution);
        setTargetBand(data.target_band?.toString() ?? '');
        setDeadline(data.deadline ?? '');
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    await supabaseBrowser.from('visa_targets').upsert({
      user_id: user.id,
      institution,
      target_band: targetBand ? parseFloat(targetBand) : null,
      deadline: deadline || null,
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Institution"
        value={institution}
        onChange={(e) => setInstitution(e.target.value)}
        required
      />
      <Input
        label="Target Band"
        type="number"
        step="0.5"
        min="4"
        max="9"
        value={targetBand}
        onChange={(e) => setTargetBand(e.target.value)}
        required
      />
      <Input
        label="Deadline"
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <Button type="submit" loading={loading} className="rounded-ds-xl">
        Save Target
      </Button>
    </form>
  );
};

export default TargetScoreForm;
