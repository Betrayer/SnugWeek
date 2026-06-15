const ASKED_KEY = "snugweek-notif-asked";

export const notifSupported = (): boolean =>
  typeof window !== "undefined" && "Notification" in window;

export const notifPermission = (): NotificationPermission =>
  notifSupported() ? Notification.permission : "denied";

export const hasAskedNotif = (): boolean => {
  try {
    return localStorage.getItem(ASKED_KEY) === "1";
  } catch {
    return false;
  }
};

export const markAskedNotif = (): void => {
  try {
    localStorage.setItem(ASKED_KEY, "1");
  } catch (error) {
    console.error(error);
  }
};

export const requestNotif = async (): Promise<NotificationPermission> => {
  markAskedNotif();
  if (!notifSupported()) return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
};

const fallbackNotification = (
  title: string,
  options: NotificationOptions,
): void => {
  try {
    new Notification(title, options);
  } catch (error) {
    console.error(error);
  }
};

export const showSystemNotification = (
  title: string,
  body: string,
  tag: string,
): void => {
  if (notifPermission() !== "granted") return;
  const options: NotificationOptions = { body, tag, icon: "/pwa-192x192.png" };
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        if (registration) void registration.showNotification(title, options);
        else fallbackNotification(title, options);
      })
      .catch(() => fallbackNotification(title, options));
    return;
  }
  fallbackNotification(title, options);
};
