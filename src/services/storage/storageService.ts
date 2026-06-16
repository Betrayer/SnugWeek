import {
  deleteObject as deleteStorageObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "../firebase.ts";

export interface UploadResult {
  path: string;
  url: string;
}

export const attachmentObjectPath = (
  uid: string,
  attachmentId: string,
  fileName: string,
): string => `users/${uid}/${attachmentId}/${fileName}`;

export const uploadFile = (
  path: string,
  blob: Blob,
  onProgress?: (fraction: number) => void,
): Promise<UploadResult> =>
  new Promise<UploadResult>((resolve, reject) => {
    const objectRef = ref(storage, path);
    const task = uploadBytesResumable(objectRef, blob, {
      contentType: blob.type || "application/octet-stream",
    });
    task.on(
      "state_changed",
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          onProgress(snapshot.bytesTransferred / snapshot.totalBytes);
        }
      },
      reject,
      () => {
        getDownloadURL(objectRef).then((url) => resolve({ path, url }), reject);
      },
    );
  });

export const getDownloadUrl = (path: string): Promise<string> =>
  getDownloadURL(ref(storage, path));

export const deleteObject = (path: string): Promise<void> =>
  deleteStorageObject(ref(storage, path));
