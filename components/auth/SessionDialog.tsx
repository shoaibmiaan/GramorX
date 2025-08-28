import React from 'react';
import { Modal } from '@/components/design-system/Modal';
import { Button } from '@/components/design-system/Button';

export interface SessionInfo {
  id: string;
  user_agent: string | null;
  created_at: string;
  ip: string | null;
}

interface Props {
  sessions: SessionInfo[];
  onKeepOnlyHere: () => void;
  onClose: () => void;
}

export default function SessionDialog({ sessions, onKeepOnlyHere, onClose }: Props) {
  if (!sessions.length) return null;
  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Other active sessions"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Keep all sessions
          </Button>
          <Button onClick={onKeepOnlyHere}>Keep me signed in only here</Button>
        </div>
      }
    >
      <p className="mb-4 text-body">You have other active sessions:</p>
      <ul className="space-y-1 text-body">
        {sessions.map((s) => (
          <li key={s.id}>
            {s.user_agent || 'Unknown'}{s.ip ? ` • ${s.ip}` : ''}
          </li>
        ))}
      </ul>
    </Modal>
  );
}

