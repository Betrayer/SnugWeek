const STORAGE_KEY = "snugweek-recap-dismissed";

export const loadRecapDismissed = (): string | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return typeof raw === "string" && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
};

export const dismissRecap = (weekId: string): void => {
  try {
    localStorage.setItem(STORAGE_KEY, weekId);
  } catch (error) {
    console.error(error);
  }
};
