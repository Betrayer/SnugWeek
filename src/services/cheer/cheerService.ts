import i18next from "i18next";
import { useCheerStore } from "../../state/cheerStore.ts";
import { useSettingsStore } from "../../state/settingsStore.ts";
import { CHEER_GLYPHS, CHEER_MESSAGE_KEYS } from "./cheerMessages.ts";
import type { CheerKind } from "./cheerMessages.ts";

const PLAIN_GAP_MS = 1100;
const MILESTONE_GAP_MS = 350;
const SUBTLE_PLAIN_CHANCE = 0.12;
const FULL_PLAIN_CHANCE = 0.5;

let lastPlainAt = 0;
let lastMilestoneAt = 0;

const pick = <T>(items: T[]): T | null => {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)] ?? null;
};

const prefersReducedMotion = (): boolean => {
  if (useSettingsStore.getState().reduceMotion) return true;
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const emit = (
  kind: CheerKind,
  milestone: boolean,
  vars?: Record<string, string | number>,
): void => {
  const level = useSettingsStore.getState().cheerLevel;
  if (level === "off") return;
  const now = Date.now();
  if (milestone) {
    if (now - lastMilestoneAt < MILESTONE_GAP_MS) return;
    lastMilestoneAt = now;
  } else {
    const chance = level === "full" ? FULL_PLAIN_CHANCE : SUBTLE_PLAIN_CHANCE;
    if (Math.random() > chance) return;
    if (now - lastPlainAt < PLAIN_GAP_MS) return;
    lastPlainAt = now;
  }
  const messageKey = pick(CHEER_MESSAGE_KEYS[kind]);
  const glyph = pick(CHEER_GLYPHS[kind]);
  if (!messageKey || !glyph) return;
  useCheerStore.getState().push({
    message: i18next.t(messageKey, vars ?? {}),
    glyph,
    motion: !prefersReducedMotion(),
  });
};

export const cheerHabit = (): void => emit("habit", false);

export const cheerTask = (): void => emit("task", false);

export const cheerDayClear = (): void => emit("dayClear", true);

export const cheerStreak = (name: string, count: number): void =>
  emit("streak", true, { name, count });
