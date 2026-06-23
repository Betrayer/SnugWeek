export type FontSlot = "body" | "hand";

export interface FontSpec {
  id: string;
  name: string;
  slot: FontSlot;
  stack: string;
  preload: string[];
}
