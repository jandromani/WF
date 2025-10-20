import { MiniKit, Permission } from '@worldcoin/minikit-js';

type NotificationPayload = {
  title: string;
  body: string;
};

type NotificationListener = (notification: NotificationPayload) => void;

const notificationListeners = new Set<NotificationListener>();

let notificationsGranted: boolean | null = null;
let isRequestingPermission = false;

const isMiniKitAvailable = () =>
  typeof window !== 'undefined' && typeof MiniKit !== 'undefined';

const emitNotification = (payload: NotificationPayload) => {
  notificationListeners.forEach((listener) => {
    listener(payload);
  });
};

const ensureNotificationPermission = async () => {
  if (!isMiniKitAvailable()) {
    return false;
  }

  if (notificationsGranted) {
    return true;
  }

  if (isRequestingPermission) {
    return notificationsGranted ?? false;
  }

  try {
    isRequestingPermission = true;
    const permissionsResponse = await MiniKit.commandsAsync
      .getPermissions?.();
    const finalPermissions = permissionsResponse?.finalPayload as
      | { permissions?: { notifications?: boolean } }
      | undefined;

    if (finalPermissions?.permissions?.notifications) {
      notificationsGranted = true;
      return true;
    }

    const requestResponse = await MiniKit.commandsAsync
      .requestPermission?.({
        permission: Permission.Notifications,
      });

    const requestPayload = requestResponse?.finalPayload as
      | { status?: string; permissions?: { notifications?: boolean } }
      | undefined;

    const statusGranted = requestPayload?.status === 'granted';

    notificationsGranted =
      requestPayload?.permissions?.notifications ?? statusGranted;

    return notificationsGranted;
  } catch (error) {
    console.warn('Failed to request MiniKit notification permission', error);
    notificationsGranted = false;
    return false;
  } finally {
    isRequestingPermission = false;
  }
};

export const subscribeToNotifications = (
  listener: NotificationListener,
) => {
  notificationListeners.add(listener);
  return () => {
    notificationListeners.delete(listener);
  };
};

export const notify = async ({ title, body }: NotificationPayload) => {
  const payload = { title, body };

  if (await ensureNotificationPermission()) {
    try {
      const miniKitNotify = (MiniKit.commandsAsync as unknown as {
        notify?: (input: NotificationPayload) => Promise<unknown>;
      })?.notify;

      await miniKitNotify?.(payload);
    } catch (error) {
      console.warn('Failed to send MiniKit notification', error);
    }
  }

  emitNotification(payload);
};
