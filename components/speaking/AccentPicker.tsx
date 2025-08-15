import React from 'react';

export const AccentPicker: React.FC<{
  voices: SpeechSynthesisVoice[];
  voiceName: string;
  onChange: (n: string) => void;
  className?: string;
}> = ({ voices, voiceName, onChange, className = '' }) => {
  const english = voices.filter(v => /en[-_]/i.test(v.lang));
  return (
    <div className={className}>
      <label className="block">
        <span className="mb-1.5 inline-block text-small text-gray-600 dark:text-grayish">Accent & Voice</span>
        <select
          className="w-full p-3.5 rounded-ds border border-gray-200 dark:border-white/10 bg-white dark:bg-dark"
          value={voiceName}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">System default</option>
          {english.map(v => (
            <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
          ))}
        </select>
      </label>
      {english.length === 0 && (
        <p className="text-grayish text-small mt-2">No English voices detected. Try a desktop browser.</p>
      )}
    </div>
  );
};
