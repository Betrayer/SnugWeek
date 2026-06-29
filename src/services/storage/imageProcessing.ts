export interface ProcessedImage {
  full: Blob;
  thumb: Blob;
  width: number;
  height: number;
  ext: string;
  mime: string;
}

const MAX_FULL_EDGE = 2560;
const MAX_THUMB_EDGE = 480;
const FULL_QUALITY_STEPS = [0.9, 0.82, 0.74];
const THUMB_QUALITY = 0.78;
const FULL_SIZE_TARGET = 9.5 * 1024 * 1024;

let webpSupport: boolean | null = null;

const supportsWebp = (): boolean => {
  if (webpSupport !== null) return webpSupport;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  webpSupport = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  return webpSupport;
};

const loadImage = (file: Blob): Promise<HTMLImageElement> =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode-failed"));
    };
    image.src = url;
  });

const scaledSize = (
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } => {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const ratio = maxEdge / longest;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
};

const encode = (
  image: HTMLImageElement,
  maxEdge: number,
  mime: string,
  quality: number,
): Promise<Blob> => {
  const size = scaledSize(image.naturalWidth, image.naturalHeight, maxEdge);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, size.width);
  canvas.height = Math.max(1, size.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("no-canvas-context"));
  if (mime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("encode-failed"));
      },
      mime,
      quality,
    );
  });
};

const encodeFull = async (
  image: HTMLImageElement,
  mime: string,
): Promise<Blob> => {
  let blob = await encode(image, MAX_FULL_EDGE, mime, FULL_QUALITY_STEPS[0] ?? 0.9);
  for (
    let step = 1;
    step < FULL_QUALITY_STEPS.length && blob.size > FULL_SIZE_TARGET;
    step += 1
  ) {
    blob = await encode(image, MAX_FULL_EDGE, mime, FULL_QUALITY_STEPS[step] ?? 0.74);
  }
  return blob;
};

export const processImage = async (file: File): Promise<ProcessedImage> => {
  const image = await loadImage(file);
  const useWebp = supportsWebp();
  const mime = useWebp ? "image/webp" : "image/jpeg";
  const ext = useWebp ? "webp" : "jpg";
  const full = await encodeFull(image, mime);
  const thumb = await encode(image, MAX_THUMB_EDGE, mime, THUMB_QUALITY);
  return {
    full,
    thumb,
    width: image.naturalWidth,
    height: image.naturalHeight,
    ext,
    mime,
  };
};

const POSTER_TIMEOUT_MS = 6000;

export const grabVideoPoster = (
  file: File,
  maxEdge = MAX_THUMB_EDGE,
): Promise<Blob | null> =>
  new Promise<Blob | null>((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    let settled = false;
    let watchdog: ReturnType<typeof setTimeout> | null = null;
    const finish = (blob: Blob | null) => {
      if (settled) return;
      settled = true;
      if (watchdog) clearTimeout(watchdog);
      URL.revokeObjectURL(url);
      resolve(blob);
    };
    watchdog = setTimeout(() => finish(null), POSTER_TIMEOUT_MS);
    video.muted = true;
    video.preload = "metadata";
    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(0.5, video.duration || 0.5);
      } catch {
        finish(null);
      }
    };
    video.onseeked = () => {
      const size = scaledSize(
        video.videoWidth || maxEdge,
        video.videoHeight || maxEdge,
        maxEdge,
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, size.width);
      canvas.height = Math.max(1, size.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        finish(null);
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => finish(blob), "image/jpeg", 0.7);
    };
    video.onerror = () => finish(null);
    video.src = url;
  });
