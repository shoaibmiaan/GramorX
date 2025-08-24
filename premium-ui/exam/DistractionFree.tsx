import * as React from 'react';

export function DistractionFreeBanner() {
  const [blurred, setBlurred] = React.useState(false);

  React.useEffect(() => {
    const onBlur = () => setBlurred(true);
    const onFocus = () => setBlurred(false);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  if (!blurred) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-50 bg-yellow-500 text-black text-center py-2 font-medium">
      You switched tabs or windows. For best results, stay focused in the exam window.
    </div>
  );
}
