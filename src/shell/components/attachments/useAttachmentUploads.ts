import { useCallback, useRef, useState } from "react";
import { notifyInfo } from "../../../services/notify.ts";
import {
  grabVideoPoster,
  processImage,
} from "../../../services/storage/imageProcessing.ts";
import {
  attachmentObjectPath,
  deleteObject,
  uploadFile,
} from "../../../services/storage/storageService.ts";
import { newAttachmentId } from "../../../services/repos/attachmentsRepo.ts";
import type { AttachmentKind } from "../../../services/repos/attachmentsRepo.ts";
import {
  MAX_ATTACHMENTS,
  useAttachmentsStore,
  type AddTarget,
  type AttachmentDraft,
} from "../../../state/attachmentsStore.ts";
import { useAuthStore } from "../../../state/authStore.ts";

const MB = 1024 * 1024;
export const IMAGE_INPUT_MAX = 25 * MB;
export const IMAGE_MAX = 10 * MB;
export const MEDIA_MAX = 50 * MB;
export const FILE_MAX = 25 * MB;

export const DOC_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export interface UploadProgress {
  tempId: string;
  name: string;
  fraction: number;
  failed: boolean;
  kind: AttachmentKind;
}

const MEDIA_META_TIMEOUT_MS = 6000;

const extFromMime = (mime: string): string => {
  const subtype = mime.split("/")[1] ?? "";
  const clean = subtype.split(";")[0] ?? "";
  return clean.length > 0 ? clean : "bin";
};

const extFromFile = (file: File): string => {
  const dot = file.name.lastIndexOf(".");
  if (dot > 0 && dot < file.name.length - 1) {
    return file.name.slice(dot + 1).toLowerCase();
  }
  return extFromMime(file.type);
};

const probeDuration = (
  file: Blob,
  kind: "audio" | "video",
): Promise<number | null> =>
  new Promise<number | null>((resolve) => {
    const element = document.createElement(kind);
    const url = URL.createObjectURL(file);
    let settled = false;
    const finish = (value: number | null) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve(value);
    };
    const watchdog = setTimeout(() => finish(null), MEDIA_META_TIMEOUT_MS);
    element.preload = "metadata";
    element.onloadedmetadata = () => {
      clearTimeout(watchdog);
      finish(
        Number.isFinite(element.duration)
          ? Math.round(element.duration * 1000)
          : null,
      );
    };
    element.onerror = () => {
      clearTimeout(watchdog);
      finish(null);
    };
    element.src = url;
  });

let counter = 0;
const nextTempId = (): string => {
  counter += 1;
  return `up-${Date.now()}-${counter}`;
};

export const useAttachmentUploads = (target: AddTarget) => {
  const uid = useAuthStore((state) => state.uid);
  const add = useAttachmentsStore((state) => state.add);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const inFlightRef = useRef(0);

  const storedCount = useCallback((): number => {
    const byKey = useAttachmentsStore.getState().byKey;
    if (target.type === "task") {
      return (byKey[`task:${target.taskId}`] ?? []).length;
    }
    if (target.type === "list") {
      return (byKey[`list:${target.listId}`] ?? []).length;
    }
    return (byKey[`week:${target.weekId}`] ?? []).filter(
      (item) => item.day === target.day,
    ).length;
  }, [target]);

  const hasSlot = useCallback(
    (): boolean => storedCount() + inFlightRef.current < MAX_ATTACHMENTS,
    [storedCount],
  );

  const patch = useCallback((tempId: string, next: Partial<UploadProgress>) => {
    setUploads((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, ...next } : item)),
    );
  }, []);

  const drop = useCallback((tempId: string) => {
    setUploads((prev) => prev.filter((item) => item.tempId !== tempId));
  }, []);

  const begin = useCallback((kind: AttachmentKind, name: string): string => {
    inFlightRef.current += 1;
    const tempId = nextTempId();
    setUploads((prev) => [
      ...prev,
      { tempId, name, fraction: 0, failed: false, kind },
    ]);
    return tempId;
  }, []);

  const settle = useCallback(() => {
    inFlightRef.current = Math.max(0, inFlightRef.current - 1);
  }, []);

  const fail = useCallback(
    (tempId: string, paths: string[]) => {
      settle();
      for (const path of paths) void deleteObject(path).catch(() => {});
      patch(tempId, { failed: true });
      notifyInfo("attachments:uploadError");
      window.setTimeout(() => drop(tempId), 4000);
    },
    [settle, patch, drop],
  );

  const finalize = useCallback(
    (tempId: string, draft: AttachmentDraft, paths: string[]) => {
      const added = add(target, draft);
      settle();
      if (!added) {
        notifyInfo("attachments:limitReached", { max: MAX_ATTACHMENTS });
        for (const path of paths) void deleteObject(path).catch(() => {});
      }
      drop(tempId);
    },
    [add, target, settle, drop],
  );

  const limitNotice = useCallback(() => {
    notifyInfo("attachments:limitReached", { max: MAX_ATTACHMENTS });
  }, []);

  const addImageFiles = useCallback(
    (files: File[]) => {
      if (!uid) return;
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          notifyInfo("attachments:typeError");
          continue;
        }
        if (file.size > IMAGE_INPUT_MAX) {
          notifyInfo("attachments:tooBig", { size: 25 });
          continue;
        }
        if (!hasSlot()) {
          limitNotice();
          break;
        }
        const tempId = begin("image", file.name);
        void (async () => {
          const paths: string[] = [];
          try {
            const processed = await processImage(file);
            if (processed.full.size > IMAGE_MAX) {
              fail(tempId, paths);
              return;
            }
            const id = newAttachmentId(uid);
            const fullResult = await uploadFile(
              attachmentObjectPath(uid, id, `original.${processed.ext}`),
              processed.full,
              (fraction) => patch(tempId, { fraction }),
            );
            paths.push(fullResult.path);
            const thumbResult = await uploadFile(
              attachmentObjectPath(uid, id, `thumb.${processed.ext}`),
              processed.thumb,
            );
            paths.push(thumbResult.path);
            finalize(
              tempId,
              {
                id,
                kind: "image",
                storagePath: fullResult.path,
                url: fullResult.url,
                thumbPath: thumbResult.path,
                thumbUrl: thumbResult.url,
                width: processed.width,
                height: processed.height,
                name: file.name,
                mime: processed.mime,
                size: processed.full.size,
              },
              paths,
            );
          } catch {
            fail(tempId, paths);
          }
        })();
      }
    },
    [uid, hasSlot, begin, patch, fail, finalize, limitNotice],
  );

  const uploadMedia = useCallback(
    (file: Blob, kind: "audio" | "video", displayName: string) => {
      if (!uid) return;
      if (file.size > MEDIA_MAX) {
        notifyInfo("attachments:tooBig", { size: 50 });
        return;
      }
      if (!hasSlot()) {
        limitNotice();
        return;
      }
      const tempId = begin(kind, displayName);
      void (async () => {
        const paths: string[] = [];
        try {
          const durationMs = await probeDuration(file, kind);
          const poster =
            kind === "video" && file instanceof File
              ? await grabVideoPoster(file)
              : null;
          const ext =
            file instanceof File ? extFromFile(file) : extFromMime(file.type);
          const id = newAttachmentId(uid);
          const mainResult = await uploadFile(
            attachmentObjectPath(uid, id, `original.${ext}`),
            file,
            (fraction) => patch(tempId, { fraction }),
          );
          paths.push(mainResult.path);
          let thumbPath: string | null = null;
          let thumbUrl: string | null = null;
          if (poster) {
            const posterResult = await uploadFile(
              attachmentObjectPath(uid, id, "thumb.jpg"),
              poster,
            );
            paths.push(posterResult.path);
            thumbPath = posterResult.path;
            thumbUrl = posterResult.url;
          }
          finalize(
            tempId,
            {
              id,
              kind,
              storagePath: mainResult.path,
              url: mainResult.url,
              thumbPath,
              thumbUrl,
              name: displayName,
              mime: file.type || `${kind}/${ext}`,
              size: file.size,
              durationMs,
            },
            paths,
          );
        } catch {
          fail(tempId, paths);
        }
      })();
    },
    [uid, hasSlot, begin, patch, fail, finalize, limitNotice],
  );

  const addAudioFiles = useCallback(
    (files: File[]) => {
      for (const file of files) {
        if (!file.type.startsWith("audio/")) {
          notifyInfo("attachments:typeError");
          continue;
        }
        uploadMedia(file, "audio", file.name);
      }
    },
    [uploadMedia],
  );

  const addVideoFiles = useCallback(
    (files: File[]) => {
      for (const file of files) {
        if (!file.type.startsWith("video/")) {
          notifyInfo("attachments:typeError");
          continue;
        }
        uploadMedia(file, "video", file.name);
      }
    },
    [uploadMedia],
  );

  const addRecording = useCallback(
    (blob: Blob, durationMs: number, displayName: string) => {
      if (!uid) return;
      if (!hasSlot()) {
        limitNotice();
        return;
      }
      const tempId = begin("audio", displayName);
      void (async () => {
        const paths: string[] = [];
        try {
          const ext = extFromMime(blob.type || "audio/webm");
          const id = newAttachmentId(uid);
          const mainResult = await uploadFile(
            attachmentObjectPath(uid, id, `original.${ext}`),
            blob,
            (fraction) => patch(tempId, { fraction }),
          );
          paths.push(mainResult.path);
          finalize(
            tempId,
            {
              id,
              kind: "audio",
              storagePath: mainResult.path,
              url: mainResult.url,
              name: displayName,
              mime: blob.type || "audio/webm",
              size: blob.size,
              durationMs,
            },
            paths,
          );
        } catch {
          fail(tempId, paths);
        }
      })();
    },
    [uid, hasSlot, begin, patch, fail, finalize, limitNotice],
  );

  const addGenericFiles = useCallback(
    (files: File[]) => {
      if (!uid) return;
      const images = files.filter((file) => file.type.startsWith("image/"));
      const audios = files.filter((file) => file.type.startsWith("audio/"));
      const videos = files.filter((file) => file.type.startsWith("video/"));
      const docs = files.filter(
        (file) =>
          !file.type.startsWith("image/") &&
          !file.type.startsWith("audio/") &&
          !file.type.startsWith("video/"),
      );
      if (images.length > 0) addImageFiles(images);
      if (audios.length > 0) addAudioFiles(audios);
      if (videos.length > 0) addVideoFiles(videos);
      for (const file of docs) {
        if (!DOC_MIME_TYPES.includes(file.type)) {
          notifyInfo("attachments:typeError");
          continue;
        }
        if (file.size > FILE_MAX) {
          notifyInfo("attachments:tooBig", { size: 25 });
          continue;
        }
        if (!hasSlot()) {
          limitNotice();
          break;
        }
        const tempId = begin("file", file.name);
        void (async () => {
          const paths: string[] = [];
          try {
            const id = newAttachmentId(uid);
            const mainResult = await uploadFile(
              attachmentObjectPath(uid, id, `file.${extFromFile(file)}`),
              file,
              (fraction) => patch(tempId, { fraction }),
            );
            paths.push(mainResult.path);
            finalize(
              tempId,
              {
                id,
                kind: "file",
                storagePath: mainResult.path,
                url: mainResult.url,
                name: file.name,
                mime: file.type,
                size: file.size,
              },
              paths,
            );
          } catch {
            fail(tempId, paths);
          }
        })();
      }
    },
    [
      uid,
      hasSlot,
      begin,
      patch,
      fail,
      finalize,
      limitNotice,
      addImageFiles,
      addAudioFiles,
      addVideoFiles,
    ],
  );

  return {
    uploads,
    addImageFiles,
    addAudioFiles,
    addVideoFiles,
    addGenericFiles,
    addRecording,
  };
};
