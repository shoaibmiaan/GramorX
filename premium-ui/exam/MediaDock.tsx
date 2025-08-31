import * as React from 'react';

export type MediaItem = {
  id: string;
  type: 'audio' | 'video';
  src: string;
  title?: string;
};

export type MediaDockProps = {
  /** Initial list of media items */
  initialItems?: MediaItem[];
  /** Callback whenever the list changes */
  onItemsChange?: (items: MediaItem[]) => void;
};

export function MediaDock({ initialItems = [], onItemsChange }: MediaDockProps) {
  const [items, setItems] = React.useState<MediaItem[]>(initialItems);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = `${Date.now()}-${file.name}`;
    const type = file.type.startsWith('video') ? 'video' : 'audio';
    const src = URL.createObjectURL(file);
    const next = [...items, { id, type, src, title: file.name }];
    setItems(next);
    onItemsChange?.(next);
    e.target.value = '';
  };

  const remove = (id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      onItemsChange?.(next);
      return next;
    });
  };

  return (
    <div className="pr p-3 rounded-2xl border border-[var(--pr-border)] bg-[var(--pr-card)]">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium">Media Dock</h2>
        <label className="cursor-pointer text-xs font-medium text-[var(--pr-primary)]">
          + Add
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/*"
            className="hidden"
            onChange={handleAdd}
          />
        </label>
      </div>
      {items.length === 0 ? (
      <p className="text-sm opacity-70">No media added.</p>
      ) : (
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id} className="flex flex-col gap-1">
            {item.type === 'audio' ? (
              <audio controls src={item.src} className="w-full rounded-md" />
            ) : (
              <video controls src={item.src} className="w-full rounded-md h-40" />
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="truncate">{item.title}</span>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="text-[var(--pr-primary)] hover:underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}

