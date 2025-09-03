import React, { useEffect, useState } from 'react';
import { Button } from '@/components/design-system/Button';

type Props = {
  resourceId: string;
  type?: string;
  category: string;
};

export const SaveItemButton: React.FC<Props> = ({ resourceId, type = '', category }) => {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!resourceId) return;
    (async () => {
      try {
        const url = `/api/saved/${category}?resource_id=${resourceId}${type ? `&type=${type}` : ''}`;
        const res = await fetch(url);
        if (active && res.ok) {
          const data = await res.json();
          setSaved(Array.isArray(data) && data.length > 0);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [resourceId, type, category]);

  const toggle = async () => {
    if (!resourceId) return;
    const body: Record<string, string> = { resource_id: resourceId };
    if (type) body.type = type;
    if (saved) {
      await fetch(`/api/saved/${category}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setSaved(false);
    } else {
      await fetch(`/api/saved/${category}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
      leadingIcon={<i className={`${saved ? 'fas' : 'far'} fa-bookmark`} aria-hidden="true" />}
    >
      {saved ? 'Saved' : 'Save'}
    </Button>
  );
};

export default SaveItemButton;
