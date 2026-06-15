export const REMINDER_OFFSETS = [0, 5, 10, 30, 60] as const;

export const offsetKey = (minutes: number): string =>
  minutes === 0 ? "at" : `m${minutes}`;
