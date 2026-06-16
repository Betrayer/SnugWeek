const STORAGE_KEY = "snugweek-search-recents";
const MAX_RECENTS = 6;

const readRecents = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string")
      .slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
};

export const loadSearchRecents = (): string[] => readRecents();

export const pushSearchRecent = (query: string): string[] => {
  const trimmed = query.trim();
  if (trimmed.length === 0) return readRecents();
  const next = [
    trimmed,
    ...readRecents().filter(
      (item) => item.toLowerCase() !== trimmed.toLowerCase(),
    ),
  ].slice(0, MAX_RECENTS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.error(error);
  }
  return next;
};
