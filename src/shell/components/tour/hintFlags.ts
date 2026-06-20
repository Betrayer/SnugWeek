const PREFIX = "snugweek-hint-";

export const HINT_IDS = [
  "tags",
  "reminders",
  "attachments",
  "decorations",
  "focus",
  "lock",
  "sharing",
] as const;

export const isHintSeen = (id: string): boolean => {
  try {
    return localStorage.getItem(PREFIX + id) === "1";
  } catch {
    return false;
  }
};

export const markHintSeen = (id: string): void => {
  try {
    localStorage.setItem(PREFIX + id, "1");
  } catch (error) {
    console.error(error);
  }
};

export const resetAllHints = (): void => {
  try {
    for (const id of HINT_IDS) localStorage.removeItem(PREFIX + id);
  } catch (error) {
    console.error(error);
  }
};
