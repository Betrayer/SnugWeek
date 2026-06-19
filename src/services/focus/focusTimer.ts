export type FocusPhase = "focus" | "break";

export interface FocusPreset {
  id: string;
  phase: FocusPhase;
  min: number;
}

export const FOCUS_PRESETS: FocusPreset[] = [
  { id: "focus25", phase: "focus", min: 25 },
  { id: "break5", phase: "break", min: 5 },
];

export const MS_PER_MIN = 60_000;
export const MIN_CUSTOM_MIN = 1;
export const MAX_CUSTOM_MIN = 180;
export const DEFAULT_CUSTOM_MIN = 25;

export const clampDurationMin = (min: number): number =>
  Math.min(MAX_CUSTOM_MIN, Math.max(MIN_CUSTOM_MIN, Math.round(min)));

export const formatRemaining = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};
