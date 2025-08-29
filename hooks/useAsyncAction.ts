import { useCallback, useState } from 'react';
import { useSpinner } from '@/components/design-system/Spinner';
import { useToast } from '@/components/design-system/Toast';

export function useAsyncAction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  opts?: { success?: string; error?: string }
) {
  const toast = useToast();
  const { show, hide } = useSpinner();
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (...args: T) => {
      setLoading(true);
      show();
      try {
        const res = await fn(...args);
        if (opts?.success) toast.success(opts.success);
        return res;
      } catch (err) {
        const message = opts?.error || (err instanceof Error ? err.message : 'Something went wrong');
        toast.error(message);
        return undefined as unknown as R;
      } finally {
        hide();
        setLoading(false);
      }
    },
    [fn, toast, show, hide, opts]
  );

  return [run, loading] as const;
}
