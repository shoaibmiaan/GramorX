import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

type Bookmark = {
  resource_id: string;
  type: string;
  created_at: string;
};

export function SavedItems() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);
  const [items, setItems] = useState<Bookmark[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/bookmarks');
        if (!active) return;
        if (res.status === 401) {
          setAuthed(false);
          setItems([]);
        } else if (res.ok) {
          const data = await res.json();
          setItems(data as Bookmark[]);
        }
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

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
          <div className="text-sm text-gray-600 dark:text-grayish">Sign in to access your bookmarks.</div>
        </div>
        <Button href="/login" variant="primary" className="rounded-ds-xl">Sign in</Button>
      </Card>
    );
  }

  const linkFor = (b: Bookmark) => {
    if (b.type === 'reading') return `/reading/${b.resource_id}`;
    if (b.type === 'listening') return `/listening/${b.resource_id}`;
    return `/${b.type}/${b.resource_id}`;
  };

  return (
    <Card className="p-6 rounded-ds-2xl">
      <h2 className="font-slab text-h2 mb-4">Saved items</h2>
      {items.length === 0 ? (
        <div className="text-sm text-gray-600 dark:text-grayish">No saved items yet.</div>
      ) : (
        <ul className="grid gap-2">
          {items.map((b) => (
            <li key={`${b.type}:${b.resource_id}`} className="flex items-center justify-between">
              <Link href={linkFor(b)} className="underline">
                {b.type}: {b.resource_id}
              </Link>
              <span className="text-sm text-gray-600 dark:text-grayish">
                {new Date(b.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default SavedItems;
