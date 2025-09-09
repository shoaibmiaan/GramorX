'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';

export default function TeacherStatus() {
  // Minimal static status; later fetch /api/teacher/status
  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Application Submitted</h1>
      <p className="mt-2 text-mutedText">
        Thanks! Our team will review your details. You’ll receive an email/SMS when approved.
      </p>

      <Alert variant="info" className="mt-4">
        While you wait, you can explore your student dashboard and start a mock.
      </Alert>

      <div className="mt-6 flex gap-3">
        <Button asChild variant="secondary"><Link href="/dashboard">Go to Dashboard</Link></Button>
        <Button asChild variant="link"><Link href="/onboarding/teacher">Edit application</Link></Button>
      </div>
    </div>
  );
}
