import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Alert } from '@/components/design-system/Alert';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

export default function VerifyPhonePage() {
  const router = useRouter();
  const phone = useMemo(
    () => (typeof router.query.phone === 'string' ? router.query.phone : null),
    [router.query.phone]
  );
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function verify() {
    if (!phone || !code) return;
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/'), 1500);
    }
  }

  return (
    <AuthLayout
      title="Verify your phone"
      subtitle={phone ? `Enter the code sent to ${phone}.` : 'Phone number required.'}
    >
      {error && (
        <Alert variant="error" title="Verification failed" className="mt-4">
          {error}
        </Alert>
      )}
      {success ? (
        <p className="mt-4 text-gray-600 dark:text-gray-300">Phone verified. Redirecting...</p>
      ) : phone ? (
        <div className="mt-4 space-y-2 max-w-xs">
          <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button onClick={verify}>Verify</Button>
        </div>
      ) : null}
    </AuthLayout>
  );
}
