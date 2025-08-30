import { useState } from 'react';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { redirectByRole } from '@/lib/routeAccess';

export default function MfaPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ type: 'totp', token: code });
      if (error) setError(error.message);
      else redirectByRole(data.user ?? null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Two-factor authentication" subtitle="Enter the 6-digit code from your authenticator app.">
      <form onSubmit={submit} className="mt-4 space-y-4 max-w-sm">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
          className="w-full rounded-md border px-3 py-2"
          inputMode="numeric"
          pattern="[0-9]{6}"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-vibrantPurple px-3 py-2 text-white"
        >
          {loading ? 'Verifying…' : 'Verify'}
        </button>
      </form>
      {error && (
        <Alert variant="error" title="Verification error" className="mt-4">
          {error}
        </Alert>
      )}
    </AuthLayout>
  );
}
