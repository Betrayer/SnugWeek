export interface TrackerSwatch {
  id: string;
  value: string;
}

export const TRACKER_SWATCHES: TrackerSwatch[] = [
  { id: "rose", value: "#d9788f" },
  { id: "amber", value: "#d99a3f" },
  { id: "teal", value: "#3fa6a0" },
  { id: "violet", value: "#8f7bd6" },
  { id: "fern", value: "#6fae6a" },
  { id: "sky", value: "#5b9bd6" },
  { id: "coral", value: "#df7d5e" },
  { id: "plum", value: "#b56fc0" },
];

export const MOOD_TRACKER_COLOR = "rose";
export const ENERGY_TRACKER_COLOR = "amber";
export const DEFAULT_TRACKER_COLOR = "teal";

const FALLBACK_VALUE = "#3fa6a0";

export const isTrackerColor = (id: string): boolean =>
  TRACKER_SWATCHES.some((swatch) => swatch.id === id);

export const trackerColorValue = (id: string): string =>
  TRACKER_SWATCHES.find((swatch) => swatch.id === id)?.value ?? FALLBACK_VALUE;

const hashIndex = (value: string, length: number): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100000;
  }
  return hash % length;
};

export const defaultTrackerColor = (trackerId: string): string => {
  if (trackerId === "mood") return MOOD_TRACKER_COLOR;
  if (trackerId === "energy") return ENERGY_TRACKER_COLOR;
  const swatch = TRACKER_SWATCHES[hashIndex(trackerId, TRACKER_SWATCHES.length)];
  return swatch ? swatch.id : DEFAULT_TRACKER_COLOR;
};
