import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

type SavedItem = {
  resource_id: string;
  type: string;
  category: string;
  created_at: string;
};

export function SavedItems() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [tags, setTags] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/saved');
        if (!active) return;
        if (res.status === 401) {
          setAuthed(false);
          setItems([]);
        } else if (res.ok) {
          const data = await res.json();
          setItems(data as SavedItem[]);
        }
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('saved-tags');
      if (stored) setTags(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('saved-tags', JSON.stringify(tags));
    } catch {
      // ignore
    }
  }, [tags]);

  if (loading) {
    return (
      <Card className="p-6 rounded-ds-2xl">
        <div className="animate-pulse h-5 w-40 bg-gray-200 dark:bg-white/10 rounded" />
        <div className="mt-4 animate-pulse h-4 w-64 bg-gray-200 dark:bg-white/10 rounded" />
      </Card>
    );
  }

  if (!authed) {
    return (
      <Card className="p-6 rounded-ds-2xl flex items-center justify-between">
        <div>
          <div className="font-semibold mb-1">Saved items</div>
          <div className="text-sm text-gray-600 dark:text-muted-foreground">Sign in to access your bookmarks.</div>
        </div>
        <Button href="/login" variant="primary" className="rounded-ds-xl">Sign in</Button>
      </Card>
    );
  }

  const linkFor = (b: SavedItem) => {
    if (b.category === 'vocabulary') return `/vocabulary/${b.resource_id}`;
    if (b.category === 'grammar') return `/grammar/${b.resource_id}`;
    if (b.type === 'reading') return `/reading/${b.resource_id}`;
    if (b.type === 'listening') return `/listening/${b.resource_id}`;
    return `/${b.type}/${b.resource_id}`;
  };

  return (
    <Card className="p-6 rounded-ds-2xl">
      <h2 className="font-slab text-h2 mb-4">Saved items</h2>
      <div className="mb-4 flex gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded p-1 text-sm dark:bg-black dark:border-white/10"
        >
          <option value="all">All</option>
          <option value="bookmark">Bookmarks</option>
          <option value="flagged">Flagged</option>
          <option value="retake">Retake Queue</option>
          <option value="vocabulary">Vocabulary</option>
          <option value="grammar">Grammar</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
          className="border rounded p-1 text-sm dark:bg-black dark:border-white/10"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
      {items.filter((b) => filter === 'all' || b.category === filter).length === 0 ? (
        <div className="text-sm text-gray-600 dark:text-muted-foreground">No saved items yet.</div>
      ) : (
        <ul className="grid gap-2">
          {items
            .filter((b) => filter === 'all' || b.category === filter)
            .sort((a, b) =>
              sort === 'newest'
                ? b.created_at.localeCompare(a.created_at)
                : a.created_at.localeCompare(b.created_at),
            )
            .map((b) => {
              const key = `${b.category}:${b.type}:${b.resource_id}`;
              const tagList = tags[key] || [];
              return (
                <li key={key} className="flex items-center justify-between gap-4">
                  <Link href={linkFor(b)} className="underline">
                    {b.category}: {b.resource_id}
                  </Link>
                  <div className="flex items-center gap-2">
                    {tagList.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-1 rounded bg-vibrantPurple/10 text-vibrantPurple"
                      >
                        {t}
                      </span>
                    ))}
                    <input
                      className="w-20 border rounded px-1 text-xs dark:bg-black dark:border-white/10"
                      placeholder="tag"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            setTags((prev) => {
                              const next = { ...prev };
                              const arr = next[key] ? [...next[key]] : [];
                              if (!arr.includes(val)) arr.push(val);
                              next[key] = arr;
                              return next;
                            });
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <span className="text-sm text-gray-600 dark:text-muted-foreground">
                      {new Date(b.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </Card>
  );
}

export default SavedItems;
