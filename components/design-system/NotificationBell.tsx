import React from 'react';
import { useToast } from '@/components/design-system/Toast';
import { useNotifications } from '@/components/notifications/NotificationsContext';

/**
 * Simple notification bell. When clicked it shows a toast
 * letting the user know they have no unread notifications.
 */
export const NotificationBell: React.FC = () => {
  const { info } = useToast();
  const { notifications, markAllRead } = useNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  const handleClick = () => {
    if (unread === 0) info('No new notifications');
    else markAllRead();
  };

  return (
    <button
      type="button"
      aria-label="Notifications"
      onClick={handleClick}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-purpleVibe/10"
    >
      <i className="fas fa-bell" aria-hidden="true" />
      {unread > 0 && (
        <span className="absolute right-1 top-1 inline-flex h-2 w-2 rounded-full bg-sunsetOrange" />
      )}
    </button>
  );
};

export default NotificationBell;
