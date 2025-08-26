import React, { useEffect, useState } from 'react';
import { Button } from '@/components/design-system/Button';

type Props = {
  resourceId: string;
  type: string;
};

export const BookmarkButton: React.FC<Props> = ({ resourceId, type }) => {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!resourceId) return;
    (async () => {
      try {
        const res = await fetch(`/api/bookmarks?resource_id=${resourceId}&type=${type}`);
        if (active && res.ok) {
          const data = await res.json();
          setSaved(Array.isArray(data) && data.length > 0);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [resourceId, type]);

  const toggle = async () => {
    if (!resourceId) return;
    if (saved) {
      await fetch('/api/bookmarks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_id: resourceId, type }),
      });
      setSaved(false);
    } else {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_id: resourceId, type }),
      });
      setSaved(true);
    }
  };

  return (
    <Button
      variant={saved ? 'accent' : 'secondary'}
      size="sm"
      onClick={toggle}
      disabled={loading}
      className="rounded-ds"
      leadingIcon={<i className={`${saved ? 'fas' : 'far'} fa-bookmark`} />}
    >
      {saved ? 'Saved' : 'Save'}
    </Button>
  );
};

export default BookmarkButton;
