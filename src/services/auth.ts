import {
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  linkWithPopup,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import type { AuthCredential } from "firebase/auth";
import { auth } from "./firebase.ts";

const googleProvider = new GoogleAuthProvider();

export const authErrorCode = (error: unknown): string =>
  typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : "";

const requireUser = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("no-current-user");
  return user;
};

export const linkGooglePopup = async (): Promise<void> => {
  await linkWithPopup(requireUser(), googleProvider);
};

export const linkEmailPassword = async (
  email: string,
  password: string,
): Promise<void> => {
  await linkWithCredential(
    requireUser(),
    EmailAuthProvider.credential(email, password),
  );
};

export const googleCredentialFromError = (error: unknown): unknown =>
  GoogleAuthProvider.credentialFromError(
    error as Parameters<typeof GoogleAuthProvider.credentialFromError>[0],
  );

export const signInWithGoogleCredential = async (
  credential: unknown,
): Promise<void> => {
  await signInWithCredential(auth, credential as AuthCredential);
};

export const signInGooglePopup = async (): Promise<void> => {
  await signInWithPopup(auth, googleProvider);
};

export const signInEmailPassword = async (
  email: string,
  password: string,
): Promise<void> => {
  await signInWithEmailAndPassword(auth, email, password);
};

export const sendResetEmail = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const signOutNow = async (): Promise<void> => {
  await signOut(auth);
};
