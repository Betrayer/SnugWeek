import type { DecorationAsset } from "./decorations.tsx";
import type { DecorationCategory } from "./decorationCategories.ts";
import { isDecorationCategory } from "./decorationCategories.ts";

const rawFiles = import.meta.glob<string>("./stickers/**/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

const rasterFiles = import.meta.glob<string>("./stickers/**/*.png", {
  query: "?url",
  import: "default",
  eager: true,
});

const BASE_SIZE = 54;

const stripWrappers = (raw: string): string =>
  raw
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

const innerOf = (raw: string): string => {
  const match = /<svg[^>]*>([\s\S]*)<\/svg>/i.exec(raw);
  return (match?.[1] ?? "").trim();
};

const viewBoxOf = (raw: string): string => {
  const explicit = /viewBox\s*=\s*["']([^"']+)["']/i.exec(raw);
  if (explicit?.[1]) return explicit[1].trim();
  const width = /\bwidth\s*=\s*["']?([\d.]+)/i.exec(raw);
  const height = /\bheight\s*=\s*["']?([\d.]+)/i.exec(raw);
  if (width?.[1] && height?.[1]) return `0 0 ${width[1]} ${height[1]}`;
  return "0 0 32 32";
};

const sizeFromViewBox = (viewBox: string): { w: number; h: number } => {
  const parts = viewBox.split(/[\s,]+/).map(Number);
  const vbW = parts[2];
  const vbH = parts[3];
  if (!vbW || !vbH || vbW <= 0 || vbH <= 0) return { w: BASE_SIZE, h: BASE_SIZE };
  if (vbW >= vbH) {
    return { w: BASE_SIZE, h: Math.round((BASE_SIZE * vbH) / vbW) };
  }
  return { w: Math.round((BASE_SIZE * vbW) / vbH), h: BASE_SIZE };
};

interface ParsedPath {
  category: DecorationCategory;
  name: string;
  colorful: boolean;
}

const parsePath = (path: string, ext: RegExp): ParsedPath => {
  const segments = path.split("/");
  const stickersAt = segments.indexOf("stickers");
  const rest = segments.slice(stickersAt + 1);
  const file = (rest.pop() ?? "").replace(ext, "");
  const folder = rest[0] ?? "misc";
  const colorful = /\.color$/i.test(file);
  const name = file.replace(/\.color$/i, "");
  const category: DecorationCategory = isDecorationCategory(folder)
    ? folder
    : "misc";
  return { category, name, colorful };
};

const buildDropped = (): DecorationAsset[] => {
  const assets: DecorationAsset[] = [];
  for (const path of Object.keys(rawFiles).sort()) {
    const raw = stripWrappers(rawFiles[path] ?? "");
    const inner = innerOf(raw);
    if (inner.length === 0) continue;
    const { category, name, colorful } = parsePath(path, /\.svg$/i);
    const viewBox = viewBoxOf(raw);
    const { w, h } = sizeFromViewBox(viewBox);
    assets.push({
      id: `drop-${category}-${name}`,
      kind: "sticker",
      category,
      tint: colorful ? "var(--sw-ink-2)" : "var(--sw-accent)",
      w,
      h,
      viewBox,
      body: <g dangerouslySetInnerHTML={{ __html: inner }} />,
    });
  }
  for (const path of Object.keys(rasterFiles).sort()) {
    const src = rasterFiles[path];
    if (!src) continue;
    const { category, name } = parsePath(path, /\.png$/i);
    assets.push({
      id: `drop-${category}-${name}`,
      kind: "sticker",
      category,
      w: BASE_SIZE,
      h: BASE_SIZE,
      src,
    });
  }
  return assets;
};

export const DROPPED_DECORATIONS: DecorationAsset[] = buildDropped();
