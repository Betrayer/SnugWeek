import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import type { User } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  waitForPendingWrites,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const storage = getStorage(app);

export interface AuthUser {
  uid: string;
  isAnonymous: boolean;
  email: string | null;
  displayName: string | null;
  providerIds: string[];
}

const toAuthUser = (user: User | null): AuthUser | null =>
  user
    ? {
        uid: user.uid,
        isAnonymous: user.isAnonymous,
        email: user.email,
        displayName: user.displayName,
        providerIds: user.providerData.map((info) => info.providerId),
      }
    : null;

export const subscribeAuthUser = (
  onUser: (user: AuthUser | null) => void,
): (() => void) =>
  onAuthStateChanged(auth, (user) => onUser(toAuthUser(user)));

export const currentAuthUser = (): AuthUser | null => toAuthUser(auth.currentUser);

export const signInAnonymouslyNow = async (): Promise<void> => {
  await signInAnonymously(auth);
};

export const flushPendingWrites = (): Promise<void> => waitForPendingWrites(db);
