import { useSettingsStore } from "../../state/settingsStore.ts";

type AudioContextCtor = new () => AudioContext;

interface ToneOptions {
  type: OscillatorType;
  from: number;
  to?: number;
  start: number;
  duration: number;
  peak: number;
}

const FLIP_SOURCES = ["/sounds/flip.webm", "/sounds/flip.mp3"];

let context: AudioContext | null = null;
let master: GainNode | null = null;
let unlocked = false;
let flipBuffer: AudioBuffer | null = null;
let flipLoadStarted = false;
const lastPlayedAt: Record<string, number> = {};

const resolveCtor = (): AudioContextCtor | null => {
  if (typeof window === "undefined") return null;
  const scoped = window as typeof window & {
    webkitAudioContext?: AudioContextCtor;
  };
  return window.AudioContext ?? scoped.webkitAudioContext ?? null;
};

const ensureContext = (): AudioContext | null => {
  if (context) return context;
  const Ctor = resolveCtor();
  if (!Ctor) return null;
  const created = new Ctor();
  const gain = created.createGain();
  gain.gain.value = useSettingsStore.getState().soundVolume;
  gain.connect(created.destination);
  context = created;
  master = gain;
  return created;
};

const loadFlipSample = async (ctx: AudioContext): Promise<void> => {
  if (flipLoadStarted) return;
  flipLoadStarted = true;
  for (const url of FLIP_SOURCES) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.arrayBuffer();
      flipBuffer = await ctx.decodeAudioData(data);
      return;
    } catch {
      flipBuffer = null;
    }
  }
};

export const unlockSound = (): void => {
  const ctx = ensureContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  unlocked = true;
  void loadFlipSample(ctx);
};

export const setVolume = (volume: number): void => {
  if (master) master.gain.value = volume;
};

const beginSound = (key: string, minGapMs: number): AudioContext | null => {
  const { soundEnabled, soundVolume } = useSettingsStore.getState();
  if (!soundEnabled || !unlocked || document.hidden) return null;
  if (!context || !master) return null;
  const now = Date.now();
  if (now - (lastPlayedAt[key] ?? 0) < minGapMs) return null;
  lastPlayedAt[key] = now;
  master.gain.value = soundVolume;
  return context;
};

const tone = (ctx: AudioContext, options: ToneOptions): void => {
  if (!master) return;
  const at = ctx.currentTime + options.start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = options.type;
  osc.frequency.setValueAtTime(options.from, at);
  if (options.to !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      options.to,
      at + options.duration,
    );
  }
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(options.peak, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + options.duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(at);
  osc.stop(at + options.duration + 0.03);
};

const swoosh = (ctx: AudioContext): void => {
  tone(ctx, {
    type: "sine",
    from: 520,
    to: 190,
    start: 0,
    duration: 0.16,
    peak: 0.16,
  });
};

export const playCheck = (): void => {
  const ctx = beginSound("check", 90);
  if (!ctx) return;
  tone(ctx, {
    type: "triangle",
    from: 660,
    start: 0,
    duration: 0.09,
    peak: 0.22,
  });
  tone(ctx, {
    type: "triangle",
    from: 988,
    start: 0.075,
    duration: 0.12,
    peak: 0.2,
  });
};

export const playPop = (): void => {
  const ctx = beginSound("pop", 70);
  if (!ctx) return;
  tone(ctx, {
    type: "triangle",
    from: 320,
    to: 540,
    start: 0,
    duration: 0.1,
    peak: 0.2,
  });
};

export const playSwoosh = (): void => {
  const ctx = beginSound("swoosh", 70);
  if (!ctx) return;
  swoosh(ctx);
};

export const playFlip = (): void => {
  const ctx = beginSound("flip", 130);
  if (!ctx) return;
  if (flipBuffer && master) {
    const source = ctx.createBufferSource();
    source.buffer = flipBuffer;
    source.connect(master);
    source.start();
    return;
  }
  swoosh(ctx);
};
