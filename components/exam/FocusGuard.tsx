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

    const showWarning = (type: string) => {
      recordFocusViolation({ exam, testSlug: slug, type });
      setWarn(true);
      timer = window.setTimeout(() => setWarn(false), 5000);
    };

    const onVisibility = () => {
      if (document.hidden) {
        wasHidden = true;
      } else if (wasHidden) {
        wasHidden = false;
        showWarning('visibilitychange');
      }
    };

    const onBlur = () => showWarning('blur');

    const onFullscreen = () => {
      if (!document.fullscreenElement) {
        showWarning('fullscreenchange');
        el.requestFullscreen?.().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreen);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreen);
      if (timer) window.clearTimeout(timer);
    };
  }, [exam, slug]);

  return warn ? (
    <div className="fixed top-4 left-1/2 z-50 w-full max-w-md -translate-x-1/2">
      <Alert variant="warning" title="Stay focused">
        Leaving fullscreen or switching tabs is recorded and may invalidate your attempt.
      </Alert>
    </div>
  ) : null;
}

