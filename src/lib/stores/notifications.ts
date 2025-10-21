export type NotificationPayload = {
  title: string;
  body: string;
};

export type NotificationRecord = NotificationPayload & {
  id: string;
  createdAt: number;
};

const MAX_QUEUE_LENGTH = 50;

const queue: NotificationRecord[] = [];
const listeners = new Set<(notifications: NotificationRecord[]) => void>();

const cloneQueue = () => queue.map((notification) => ({ ...notification }));

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const emit = () => {
  const snapshot = cloneQueue();
  listeners.forEach((listener) => {
    listener(snapshot);
  });
};

export const enqueueNotification = (
  payload: NotificationPayload,
): NotificationRecord => {
  const record: NotificationRecord = {
    id: generateId(),
    createdAt: Date.now(),
    ...payload,
  };

  queue.unshift(record);

  if (queue.length > MAX_QUEUE_LENGTH) {
    queue.length = MAX_QUEUE_LENGTH;
  }

  emit();

  return record;
};

export const subscribeToNotificationQueue = (
  listener: (notifications: NotificationRecord[]) => void,
) => {
  listeners.add(listener);
  listener(cloneQueue());

  return () => {
    listeners.delete(listener);
  };
};
