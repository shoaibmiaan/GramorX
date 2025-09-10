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
  const [sms, setSms] = useState(false);
  const [wa, setWa] = useState(false);
  const [email, setEmail] = useState(true);
  const [start, setStart] = useState(''); // 'HH:MM'
  const [end, setEnd] = useState('');     // 'HH:MM'

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace('/login');
        return;
      }

      // read from notifications_opt_in
      const { data, error } = await supabase
        .from('notifications_opt_in')
        .select('sms_opt_in, wa_opt_in, email_opt_in, quiet_start, quiet_end')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!error && data) {
        setSms(!!data.sms_opt_in);
        setWa(!!data.wa_opt_in);
        setEmail(!!data.email_opt_in);
        setStart(data.quiet_start ?? '');
        setEnd(data.quiet_end ?? '');
      }

      setLoading(false);
    })();
  }, [router]);

  const save = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // upsert by user_id
    const { error } = await supabase
      .from('notifications_opt_in')
      .upsert({
        user_id: session.user.id,
        sms_opt_in: sms,
        wa_opt_in: wa,
        email_opt_in: email,
        quiet_start: start || null,
        quiet_end: end || null,
        updated_at: new Date().toISOString(),
      });

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
              <label className="flex items-center gap-2 text-body">
                <input type="checkbox" checked={email} onChange={() => setEmail(!email)} />
                EMAIL
              </label>
              <label className="flex items-center gap-2 text-body">
                <input type="checkbox" checked={sms} onChange={() => setSms(!sms)} />
                SMS
              </label>
              <label className="flex items-center gap-2 text-body">
                <input type="checkbox" checked={wa} onChange={() => setWa(!wa)} />
                WHATSAPP
              </label>
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
