import { notifications } from "@mantine/notifications";
import i18next from "i18next";

type Vars = Record<string, string | number>;

const DEDUPE_MS = 3000;
const AUTO_CLOSE_MS = 3500;

const lastShownAt: Record<string, number> = {};

const show = (key: string, vars?: Vars): void => {
  const message = i18next.t(key, vars);
  const now = Date.now();
  if (now - (lastShownAt[message] ?? 0) < DEDUPE_MS) return;
  lastShownAt[message] = now;
  notifications.show({
    message,
    autoClose: AUTO_CLOSE_MS,
    withBorder: true,
    styles: { root: { borderColor: "var(--sw-accent)" } },
  });
};

export const notifyInfo = (key: string, vars?: Vars): void => show(key, vars);

export const notifySuccess = (key: string, vars?: Vars): void => show(key, vars);
