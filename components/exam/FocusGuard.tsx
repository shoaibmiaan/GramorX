"use client";
import { useEffect, useState } from 'react';
import { Alert } from '@/components/design-system/Alert';
import { recordFocusViolation } from '@/lib/examSecurity';

interface Props {
  exam: string;
  slug?: string;
}

export default function FocusGuard({ exam, slug }: Props) {
  const [warn, setWarn] = useState(false);

  useEffect(() => {
    const el = document.documentElement as HTMLElement & { requestFullscreen?: () => Promise<void> };
    el.requestFullscreen?.().catch(() => {});

    let wasHidden = false;
    let timer: number | undefined;

    const onVisibility = () => {
      if (document.hidden) {
        wasHidden = true;
        recordFocusViolation({ exam, testSlug: slug, type: 'visibilitychange' });
      } else if (wasHidden) {
        wasHidden = false;
        setWarn(true);
        timer = window.setTimeout(() => setWarn(false), 5000);
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (timer) window.clearTimeout(timer);
    };
  }, [exam, slug]);

  return warn ? (
    <div className="fixed top-4 left-1/2 z-50 w-full max-w-md -translate-x-1/2">
      <Alert variant="warning" title="Stay focused">
        Switching tabs is recorded and may invalidate your attempt.
      </Alert>
    </div>
  ) : null;
}

