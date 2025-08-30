import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Toggle } from '@/components/design-system/Toggle';
import { StreakIndicator } from '@/components/design-system/StreakIndicator';
import { SavedItems } from '@/components/dashboard/SavedItems';
import { useStreak } from '@/hooks/useStreak';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { useToast } from '@/components/design-system/Toaster';
import type { Profile } from '@/types/profile';
import { Badge } from '@/components/design-system/Badge';
import { badges } from '@/data/badges';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [commOptIn, setCommOptIn] = useState(true);
  const [historyText, setHistoryText] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { error: toastError, success: toastSuccess } = useToast();
  const { current: streak } = useStreak();
  const earnedBadges = [...badges.streaks, ...badges.milestones, ...badges.community];

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace('/login');
        return;
      }
      setUserId(session.user.id);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error || !data || data.draft) {
        router.replace('/profile/setup');
        return;
      }

      setProfile(data as Profile);
      setCommOptIn((data as any).marketing_opt_in ?? true);
      setHistoryText((data as any).study_history ?? '');
      setLoading(false);
    })();
  }, [router]);

  const triggerUpload = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toastError('Please select a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toastError('Image too large. Max 3 MB.');
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = pub.publicUrl;
      const { error: updErr } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (updErr) throw updErr;
      const { error: profErr } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', userId);
      if (profErr) throw profErr;
      setProfile((p) => (p ? { ...p, avatar_url: publicUrl } : p));
      window.dispatchEvent(new CustomEvent('profile:avatar-changed', { detail: { url: publicUrl } }));
      toastSuccess('Photo updated');
    } catch (err: any) {
      console.error(err);
      toastError(err?.message || 'Could not upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const requestExport = async () => {
    try {
      const res = await fetch('/api/account/export');
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export.json';
      a.click();
      URL.revokeObjectURL(url);
      toastSuccess('Export ready');
    } catch (err: any) {
      toastError(err?.message || 'Could not export data');
    }
  };

  const requestDeletion = async () => {
    if (!window.confirm('Delete your account? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      await supabase.auth.signOut();
      router.replace('/');
    } catch (err: any) {
      toastError(err?.message || 'Could not delete account');
    }
  };

  if (loading) {
    return (
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <Card className="p-6 rounded-ds-2xl max-w-xl mx-auto">Loading…</Card>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="max-w-xl mx-auto space-y-6">
          <Card className="p-6 rounded-ds-2xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-slab text-display">Profile</h1>
              <div className="flex items-center gap-2">
                <StreakIndicator value={streak} />
                {earnedBadges.map((b) => (
                  <Badge key={b.id} size="sm">
                    {b.icon}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-20 w-20 rounded-full bg-vibrantPurple/10 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="Avatar" className="h-20 w-20 object-cover" />
                ) : (
                  <span className="text-2xl font-semibold text-vibrantPurple">
                    {profile?.full_name?.[0] || 'U'}
                  </span>
                )}
              </div>
              <div>
                <button
                  onClick={triggerUpload}
                  className="text-small px-4 py-2 rounded-ds bg-vibrantPurple/10 hover:bg-vibrantPurple/15 font-medium"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading…' : 'Change photo'}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>
            </div>
            <div className="space-y-2 text-body">
              <p><strong>Name:</strong> {profile?.full_name}</p>
              <p><strong>Country:</strong> {profile?.country ?? '—'}</p>
              <p><strong>English level:</strong> {profile?.english_level ?? '—'}</p>
              <p>
                <strong>Goal band:</strong>{' '}
                {profile?.goal_band ? profile.goal_band.toFixed(1) : '—'}
              </p>
              <p>
                <strong>Study preferences:</strong>{' '}
                {profile?.study_prefs?.join(', ') || '—'}
              </p>
              <p>
                <strong>Time commitment:</strong> {profile?.time_commitment ?? '—'}
              </p>
              <p>
                <strong>Preferred language:</strong>{' '}
                {profile?.preferred_language ?? '—'}
              </p>
              {profile?.exam_date && (
                <p>
                  <strong>Exam date:</strong> {profile.exam_date}
                </p>
              )}
            </div>
            <Button href="/profile/setup" variant="secondary" className="mt-6">
              Edit profile
            </Button>
          </Card>
          <Card className="p-6 rounded-ds-2xl">
            <h2 className="font-slab text-display mb-4">Account & Privacy</h2>
            <Toggle
              checked={commOptIn}
              onChange={async (checked) => {
                setCommOptIn(checked);
                const { error } = await supabase
                  .from('user_profiles')
                  .update({ marketing_opt_in: checked })
                  .eq('user_id', userId!);
                if (error) toastError(error.message);
                else toastSuccess('Preferences updated');
              }}
              label="Email communications"
              hint="Receive updates and tips"
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={requestExport}>
                Request data export
              </Button>
              <Button variant="secondary" onClick={requestDeletion}>
                Delete account
              </Button>
            </div>
          </Card>

          <SavedItems />
          <Card className="p-6 rounded-ds-2xl">
            <h2 className="font-slab text-display mb-4">Study history</h2>
            <textarea
              value={historyText}
              onChange={(e) => setHistoryText(e.target.value)}
              className="w-full rounded-ds border border-black/10 dark:border-white/10 p-2 h-32"
              placeholder="Add notes about your learning journey"
            />
            <Button
              variant="secondary"
              className="mt-4"
              onClick={async () => {
                if (!userId) return;
                const { error } = await supabase
                  .from('user_profiles')
                  .update({ study_history: historyText })
                  .eq('user_id', userId);
                if (error) toastError(error.message);
                else toastSuccess('History updated');
              }}
            >
              Save history
            </Button>
          </Card>
        </div>
      </Container>
    </section>
  );
}

