import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { useToast } from '@/components/design-system/Toaster';

export default function NotificationSettings() {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<string[]>([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace('/login');
        return;
      }
      const { data } = await supabase
        .from('user_profiles')
        .select('notification_channels, quiet_hours_start, quiet_hours_end')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (data) {
        setChannels(data.notification_channels ?? []);
        setStart(data.quiet_hours_start ?? '');
        setEnd(data.quiet_hours_end ?? '');
      }
      setLoading(false);
    })();
  }, [router]);

  const toggle = (c: string) => {
    setChannels((ch) => ch.includes(c) ? ch.filter((x) => x !== c) : [...ch, c]);
  };

  const save = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { error } = await supabase
      .from('user_profiles')
      .update({
        notification_channels: channels,
        quiet_hours_start: start || null,
        quiet_hours_end: end || null,
      })
      .eq('user_id', session.user.id);
    if (error) toastError('Could not save settings');
    else toastSuccess('Settings saved');
  };

  if (loading) {
    return (
      <section className="py-24">
        <Container>
          <Card className="p-6 max-w-xl mx-auto">Loading…</Card>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-24">
      <Container>
        <Card className="p-6 max-w-xl mx-auto space-y-6">
          <h1 className="font-slab text-display">Notifications</h1>
          <div>
            <h2 className="font-medium mb-2">Channels</h2>
            <div className="space-y-2">
              {['email', 'sms', 'whatsapp'].map((c) => (
                <label key={c} className="flex items-center gap-2 text-body">
                  <input
                    type="checkbox"
                    checked={channels.includes(c)}
                    onChange={() => toggle(c)}
                  />
                  {c.toUpperCase()}
                </label>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-medium mb-2">Quiet hours</h2>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="border rounded p-2 flex-1"
              />
              <span>to</span>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="border rounded p-2 flex-1"
              />
            </div>
          </div>
          <Button onClick={save}>Save</Button>
        </Card>
      </Container>
    </section>
  );
}

