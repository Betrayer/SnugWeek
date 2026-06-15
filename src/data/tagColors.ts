export interface TagSwatch {
  id: string;
  value: string;
}

export const TAG_SWATCHES: TagSwatch[] = [
  { id: "rose", value: "#d28aa0" },
  { id: "coral", value: "#df8c6e" },
  { id: "amber", value: "#d4a85c" },
  { id: "olive", value: "#a8b06a" },
  { id: "fern", value: "#82b598" },
  { id: "teal", value: "#6cb1ae" },
  { id: "azure", value: "#7aa6d6" },
  { id: "violet", value: "#9a8ed2" },
  { id: "plum", value: "#b884c2" },
  { id: "mocha", value: "#b18b76" },
];

export const DEFAULT_TAG_COLOR = "rose";

const FALLBACK_VALUE = "#d28aa0";

export const tagSwatchValue = (id: string): string =>
  TAG_SWATCHES.find((swatch) => swatch.id === id)?.value ?? FALLBACK_VALUE;
