import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const srcDir = resolve(here, "assets");
const outDir = resolve(root, "public");

const iconSvg = await readFile(resolve(srcDir, "icon.svg"));
const maskableSvg = await readFile(resolve(srcDir, "icon-maskable.svg"));
const ogSvg = await readFile(resolve(srcDir, "og.svg"));

const renderIcon = (svg, size, background) => {
  const pipeline = sharp(svg, { density: 384 }).resize(size, size);
  return (background ? pipeline.flatten({ background }) : pipeline)
    .png()
    .toBuffer();
};

await mkdir(outDir, { recursive: true });

const targets = [
  { file: "pwa-192x192.png", svg: iconSvg, size: 192 },
  { file: "pwa-512x512.png", svg: iconSvg, size: 512 },
  { file: "maskable-icon-512x512.png", svg: maskableSvg, size: 512 },
  { file: "apple-touch-icon-180x180.png", svg: maskableSvg, size: 180 },
];

for (const target of targets) {
  const buffer = await renderIcon(target.svg, target.size);
  await writeFile(resolve(outDir, target.file), buffer);
}

const favicon32 = await renderIcon(iconSvg, 32);
const favicon48 = await renderIcon(iconSvg, 48);
await writeFile(resolve(outDir, "favicon.ico"), await pngToIco([favicon32, favicon48]));
await writeFile(resolve(outDir, "favicon.svg"), iconSvg);

const ogPng = await sharp(ogSvg, { density: 144 })
  .resize(1200, 630)
  .png()
  .toBuffer();
await writeFile(resolve(outDir, "og-image.png"), ogPng);

console.log("Generated PWA icons, favicon, and OG image into public/");
