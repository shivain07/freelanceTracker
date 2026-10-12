let nextNotificationId = 0;

export const notifyUser = (message, variant = 'error') => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('app:notification', {
      detail: {
        id: ++nextNotificationId,
        message,
        variant,
      },
    }),
  );
};
