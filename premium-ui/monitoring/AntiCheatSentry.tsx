import * as React from 'react';

type Props = {
  attemptId?: string;
};

/**
 * AntiCheatSentry hooks into browser events to detect potential cheating
 * signals like losing focus, copying/pasting text or exiting fullscreen
 * mode. Detected events are sent to the server for logging.
 */
export function AntiCheatSentry({ attemptId }: Props) {
  React.useEffect(() => {
    if (!attemptId) return;

    const log = async (type: string) => {
      try {
        await fetch(`/api/exam/${attemptId}/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type }),
        });
      } catch {
        // Ignore network errors
      }
    };

    const onBlur = () => log('focus-lost');
    const onVisibility = () => {
      if (document.hidden) log('focus-lost');
    };
    const onCopy = () => log('copy');
    const onPaste = () => log('paste');
    const onFullscreen = () => {
      if (!document.fullscreenElement) log('fullscreen-exit');
    };

    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('fullscreenchange', onFullscreen);

    return () => {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('fullscreenchange', onFullscreen);
    };
  }, [attemptId]);

  return null;
}

export default AntiCheatSentry;
