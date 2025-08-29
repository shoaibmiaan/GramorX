import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const SpinnerCtx = createContext<{ show: () => void; hide: () => void } | null>(null);

export const SpinnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);

  return (
    <SpinnerCtx.Provider value={{ show, hide }}>
      {children}
      {visible && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/40">
          <svg
            className="h-10 w-10 animate-spin text-white"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
      )}
    </SpinnerCtx.Provider>
  );
};

export function useSpinner() {
  const ctx = useContext(SpinnerCtx);
  if (!ctx) throw new Error('useSpinner must be used within <SpinnerProvider>');
  return ctx;
}

export const Spinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);
