import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { StreakIndicator } from '@/components/design-system/StreakIndicator';
import { SavedItems } from '@/components/dashboard/SavedItems';
import { useStreak } from '@/hooks/useStreak';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { useToast } from '@/components/design-system/Toast';
import type { Profile } from '@/types/profile';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { error: toastError, success: toastSuccess } = useToast();
  const { current: streak } = useStreak();

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
              <StreakIndicator value={streak} />
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

          <SavedItems />
        </div>
      </Container>
    </section>
  );
}

