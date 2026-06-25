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

const PENCIL_SOURCES: string[][] = [
  ["/sounds/pencil-1.webm", "/sounds/pencil-1.mp3"],
  ["/sounds/pencil-2.webm", "/sounds/pencil-2.mp3"],
  ["/sounds/pencil-3.webm", "/sounds/pencil-3.mp3"],
];

let context: AudioContext | null = null;
let master: GainNode | null = null;
let unlocked = false;
let flipBuffer: AudioBuffer | null = null;
let flipLoadStarted = false;
let pencilBuffers: (AudioBuffer | null)[] = [];
let pencilLoadStarted = false;
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

const decodeFirst = async (
  ctx: AudioContext,
  sources: string[],
): Promise<AudioBuffer | null> => {
  for (const url of sources) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.arrayBuffer();
      return await ctx.decodeAudioData(data);
    } catch {
      continue;
    }
  }
  return null;
};

const loadPencilSamples = async (ctx: AudioContext): Promise<void> => {
  if (pencilLoadStarted) return;
  pencilLoadStarted = true;
  pencilBuffers = await Promise.all(
    PENCIL_SOURCES.map((sources) => decodeFirst(ctx, sources)),
  );
};

export const unlockSound = (): void => {
  const ctx = ensureContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  unlocked = true;
  void loadFlipSample(ctx);
  void loadPencilSamples(ctx);
};

export const setVolume = (volume: number): void => {
  if (master) master.gain.value = volume;
};

const beginSound = (
  key: string,
  minGapMs: number,
  ignoreHidden = false,
): AudioContext | null => {
  const { soundEnabled, soundVolume } = useSettingsStore.getState();
  if (!soundEnabled || !unlocked) return null;
  if (!ignoreHidden && document.hidden) return null;
  if (!context || !master) return null;
  const now = Date.now();
  if (now - (lastPlayedAt[key] ?? 0) < minGapMs) return null;
  lastPlayedAt[key] = now;
  if (context.state === "suspended") void context.resume();
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

export const playReminder = (): void => {
  const ctx = beginSound("reminder", 500, true);
  if (!ctx) return;
  tone(ctx, {
    type: "sine",
    from: 880,
    start: 0,
    duration: 0.18,
    peak: 0.18,
  });
  tone(ctx, {
    type: "sine",
    from: 1175,
    start: 0.14,
    duration: 0.22,
    peak: 0.16,
  });
  tone(ctx, {
    type: "sine",
    from: 1568,
    start: 0.3,
    duration: 0.26,
    peak: 0.14,
  });
};

export const playFocusStart = (): void => {
  const ctx = beginSound("focusStart", 300);
  if (!ctx) return;
  tone(ctx, {
    type: "sine",
    from: 523,
    to: 784,
    start: 0,
    duration: 0.18,
    peak: 0.16,
  });
};

export const playFocusEnd = (): void => {
  const ctx = beginSound("focusEnd", 300, true);
  if (!ctx) return;
  tone(ctx, {
    type: "sine",
    from: 784,
    start: 0,
    duration: 0.2,
    peak: 0.16,
  });
  tone(ctx, {
    type: "sine",
    from: 1047,
    start: 0.16,
    duration: 0.3,
    peak: 0.14,
  });
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

const scratch = (ctx: AudioContext): void => {
  if (!master) return;
  const duration = 0.14;
  const frameCount = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i += 1) {
    const progress = i / frameCount;
    const envelope = Math.sin(Math.PI * progress) * (1 - progress * 0.35);
    channel[i] = (Math.random() * 2 - 1) * envelope;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2600;
  filter.Q.value = 0.7;
  const gain = ctx.createGain();
  gain.gain.value = 0.26;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start(ctx.currentTime);
};

export const playStrike = (): void => {
  const ctx = beginSound("strike", 90);
  if (!ctx) return;
  const available = pencilBuffers.filter(
    (buffer): buffer is AudioBuffer => buffer !== null,
  );
  if (available.length > 0 && master) {
    const pick = available[Math.floor(Math.random() * available.length)];
    if (pick) {
      const source = ctx.createBufferSource();
      source.buffer = pick;
      source.connect(master);
      source.start();
      return;
    }
  }
  scratch(ctx);
};
