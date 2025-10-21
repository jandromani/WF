'use client';

import { useNotificationStore } from '@/lib/stores/notifications';

export const NotificationCenter = () => {
  const notifications = useNotificationStore((state) => state.notifications);

  if (!notifications.length) {
    return null;
  }

  return (
    <div className="w-full grid gap-3" data-testid="notification-center">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-left shadow-sm"
        >
          <p className="text-sm font-semibold text-blue-900">{notification.title}</p>
          {notification.body ? (
            <p className="text-xs text-blue-800">{notification.body}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
};
