import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

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

export interface AuthUser {
  uid: string;
  isAnonymous: boolean;
}

export const subscribeAuthUser = (
  onUser: (user: AuthUser | null) => void,
): (() => void) =>
  onAuthStateChanged(auth, (user) =>
    onUser(user ? { uid: user.uid, isAnonymous: user.isAnonymous } : null),
  );

export const signInAnonymouslyNow = async (): Promise<void> => {
  await signInAnonymously(auth);
};
