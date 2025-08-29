import { useCallback, useState } from 'react';
import { useToast } from '@/components/design-system/Toast';

export function useAsyncAction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  opts: { successMessage?: string; errorMessage?: string } = {}
) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | undefined> => {
      setLoading(true);
      try {
        const result = await fn(...args);
        if (opts.successMessage) success(opts.successMessage);
        return result as Awaited<ReturnType<T>>;
      } catch (e: any) {
        const msg = opts.errorMessage || e?.message || 'Something went wrong';
        error(msg);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [fn, success, error, opts.successMessage, opts.errorMessage]
  );

  return { run, loading } as const;
}
