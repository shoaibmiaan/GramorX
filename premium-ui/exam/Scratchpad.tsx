import * as React from 'react';

export type ScratchpadProps = {
  value?: string;
  onChange?: (value: string) => void;
};

export function Scratchpad({ value = '', onChange }: ScratchpadProps) {
  const [text, setText] = React.useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div className="pr p-3 rounded-2xl border border-[var(--pr-border)] bg-[var(--pr-card)]">
      <div className="mb-2 text-sm font-medium">Scratchpad</div>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Write notes here..."
        className="w-full h-32 resize-none rounded-lg border border-[var(--pr-border)] bg-[var(--pr-surface,var(--pr-card))] p-2 text-sm"
      />
    </div>
  );
}

