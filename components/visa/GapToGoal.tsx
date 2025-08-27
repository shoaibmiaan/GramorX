import React, { useEffect, useState } from 'react';

import { Card } from '@/components/design-system/Card';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import type { Profile } from '@/types/profile';

interface VisaTarget {
  user_id: string;
  institution: string;
  target_band: number;
  deadline: string | null;
}

export const GapToGoal: React.FC = () => {
  const [target, setTarget] = useState<VisaTarget | null>(null);
  const [currentBand, setCurrentBand] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();
      if (!user) return;

      const [targetRes, profileRes] = await Promise.all([
        supabaseBrowser
          .from<VisaTarget>('visa_targets')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabaseBrowser
          .from<Profile>('user_profiles')
          .select('goal_band')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (targetRes.data) setTarget(targetRes.data);
      if (profileRes.data) setCurrentBand(profileRes.data.goal_band);
    })();
  }, []);

  if (!target) return null;

  const gap = target.target_band - (currentBand ?? 0);

  return (
    <Card className="p-6 rounded-ds-2xl">
      <h3 className="font-slab text-h3 mb-2">Visa Target</h3>
      <p className="text-body">
        {target.institution}: band {target.target_band}
      </p>
      {currentBand !== null && (
        <p className="mt-2 text-body">
          Gap to goal: {gap <= 0 ? 'achieved' : gap.toFixed(1)}
        </p>
      )}
      {target.deadline && (
        <p className="mt-1 text-small opacity-80">
          Deadline: {new Date(target.deadline).toLocaleDateString()}
        </p>
      )}
    </Card>
  );
};

export default GapToGoal;
