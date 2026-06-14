export const MOOD_EMOJIS = ["😞", "🙁", "😐", "🙂", "😄"];

export const moodScale = (value: unknown): number | null => {
  if (typeof value !== "string") return null;
  const index = MOOD_EMOJIS.indexOf(value);
  return index === -1 ? null : index + 1;
};
