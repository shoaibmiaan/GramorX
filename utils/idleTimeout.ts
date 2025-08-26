import { supabaseBrowser } from '@/lib/supabaseBrowser';

/**
 * Initializes an idle timeout handler. When no user activity is detected for
 * the specified number of minutes, the current user session is terminated and
 * the browser is redirected to the login page.
 *
 * @param minutes Idle timeout in minutes.
 * @returns Cleanup function to remove listeners and clear the timer.
 */
export function initIdleTimeout(minutes: number) {
  if (typeof window === 'undefined') return () => void 0;

  let timer: ReturnType<typeof setTimeout>;

  const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

  const resetTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        await supabaseBrowser.auth.signOut();
      } finally {
        window.location.href = '/login';
      }
    }, minutes * 60 * 1000);
  };

  events.forEach((event) => window.addEventListener(event, resetTimer));
  resetTimer();

  return () => {
    clearTimeout(timer);
    events.forEach((event) => window.removeEventListener(event, resetTimer));
  };
}
