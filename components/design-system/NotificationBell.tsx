import React from 'react';
import { useToast } from '@/components/design-system/Toast';

/**
 * Simple notification bell. When clicked it shows a toast
 * letting the user know they have no unread notifications.
 */
export const NotificationBell: React.FC = () => {
  const { info } = useToast();

  return (
    <button
      type="button"
      aria-label="Notifications"
      onClick={() => info('No new notifications')}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-purpleVibe/10"
    >
      <i className="fas fa-bell" aria-hidden="true" />
    </button>
  );
};

export default NotificationBell;
