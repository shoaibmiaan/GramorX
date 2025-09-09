'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { Textarea } from '@/components/design-system/Textarea';
import { Select } from '@/components/design-system/Select';
import { Alert } from '@/components/design-system/Alert';
import Link from 'next/link';

const MODULES = ['listening','reading','writing','speaking'] as const;
type Module = typeof MODULES[number];

export default function TeacherOnboarding() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [okId, setOkId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [fullName, setFullName] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
  const [years, setYears] = useState<number>(0);
  const [modules, setModules] = useState<Module[]>([]);
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [introVideo, setIntroVideo] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);

    try {
      const res = await fetch('/api/teacher/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          timezone,
          yearsExperience: Number(years),
          modules,
          bio,
          phone: phone || undefined,
          links: { linkedin: linkedin || undefined, website: website || undefined, introVideo: introVideo || undefined },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to submit');
      setOkId(data.id);
      // push to status page
      router.replace('/onboarding/teacher/status');
    } catch (e: any) {
      setErr(e.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6 text-foreground">
      <h1 className="mb-6 text-2xl font-semibold">Teacher Application</h1>

      {err && <Alert variant="error" className="mb-4">{err}</Alert>}

      <form onSubmit={submit} className="space-y-4">
        <Input label="Full name" value={fullName} onChange={e => setFullName(e.target.value)} required />

        <Input label="Timezone" value={timezone} onChange={e => setTimezone(e.target.value)} required helperText="e.g., Asia/Karachi" />

        <Input
          label="Years of experience"
          type="number"
          min={0}
          value={years}
          onChange={e => setYears(Number(e.target.value))}
          required
        />

        <Select
          label="IELTS focus modules"
          multiple
          value={modules}
          onChange={(val: any) => setModules(val)}
          options={MODULES.map(m => ({ label: m[0].toUpperCase()+m.slice(1), value: m }))}
          helperText="Pick one or more"
        />

        <Textarea
          label="Short bio"
          value={bio}
          onChange={e => setBio(e.target.value)}
          required
          minLength={120}
          helperText="At least 120 characters."
        />

        <Input label="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+92…" />

        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="LinkedIn (optional)" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://..." />
          <Input label="Website (optional)" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." />
        </div>

        <Input label="Intro Video (optional)" value={introVideo} onChange={e => setIntroVideo(e.target.value)} placeholder="YouTube/Drive link" />

        <div className="mt-4 flex items-center gap-3">
          <Button type="submit" variant="primary" size="lg" shape="rounded" loading={busy} loadingText="Submitting…">Submit</Button>
          <Link href="/onboarding/teacher/status" className="text-primary hover:underline">Check status</Link>
        </div>
      </form>
    </div>
  );
}
