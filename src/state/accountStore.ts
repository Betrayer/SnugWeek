import { notifications } from "@mantine/notifications";
import i18next from "i18next";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  authErrorCode,
  googleCredentialFromError,
  linkEmailPassword,
  linkGooglePopup,
  sendResetEmail,
  signInEmailPassword,
  signInGooglePopup,
  signInWithGoogleCredential,
  signOutNow,
} from "../services/auth.ts";
import { currentAuthUser } from "../services/firebase.ts";
import {
  countsOf,
  exportAnonData,
  hasMeaningfulData,
  runMerge,
} from "../services/migration.ts";
import type { ExportCounts, ExportedData } from "../services/migration.ts";
import { setAccountInfo } from "../services/repos/profileRepo.ts";
import { useAuthStore } from "./authStore.ts";

type MergeKind = "google" | "email";
type MergeEntry = "link" | "signin";
type MergePhase = "idle" | "signing-in" | "transferring" | "done" | "error";
type AuthMode = "save" | "signin";

interface PendingMerge {
  kind: MergeKind;
  entry: MergeEntry;
  credential: unknown;
  email: string | null;
  password: string | null;
  counts: ExportCounts;
}

interface AccountState {
  busy: boolean;
  error: string | null;
  resetSent: boolean;
  authModalOpen: boolean;
  authMode: AuthMode;
  signOutOpen: boolean;
  pendingMerge: PendingMerge | null;
  exported: ExportedData | null;
  mergePhase: MergePhase;
  mergeDone: number;
  mergeTotal: number;
  mergeError: string | null;
  openAuthModal: (mode: AuthMode) => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: AuthMode) => void;
  clearError: () => void;
  linkGoogle: () => Promise<void>;
  linkEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  sendReset: (email: string) => Promise<void>;
  confirmMerge: () => Promise<void>;
  cancelMerge: () => void;
  dismissMerge: () => void;
  openSignOut: () => void;
  closeSignOut: () => void;
  confirmSignOut: () => Promise<void>;
}

const mapAuthError = (code: string): string => {
  switch (code) {
    case "auth/weak-password":
      return "weakPassword";
    case "auth/invalid-email":
      return "invalidEmail";
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "wrongPassword";
    case "auth/user-not-found":
      return "userNotFound";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/user-cancelled":
      return "popupClosed";
    case "auth/popup-blocked":
      return "popupBlocked";
    case "auth/network-request-failed":
      return "network";
    case "auth/too-many-requests":
      return "tooManyRequests";
    default:
      return "generic";
  }
};

const isMergeConflict = (code: string): boolean =>
  code === "auth/credential-already-in-use" ||
  code === "auth/email-already-in-use";

const notify = (key: string): void => {
  notifications.show({ message: i18next.t(key) });
};

const finishLink = async (uid: string): Promise<void> => {
  const user = currentAuthUser();
  await setAccountInfo(uid, user?.email ?? null, user?.displayName ?? null);
  useAuthStore.getState().refresh();
};

export const useAccountStore = create<AccountState>()(
  devtools(
    (set, get) => ({
      busy: false,
      error: null,
      resetSent: false,
      authModalOpen: false,
      authMode: "save",
      signOutOpen: false,
      pendingMerge: null,
      exported: null,
      mergePhase: "idle",
      mergeDone: 0,
      mergeTotal: 0,
      mergeError: null,
      openAuthModal: (mode) =>
        set({ authModalOpen: true, authMode: mode, error: null, resetSent: false }),
      closeAuthModal: () => set({ authModalOpen: false }),
      setAuthMode: (mode) => set({ authMode: mode, error: null, resetSent: false }),
      clearError: () => set({ error: null }),
      linkGoogle: async () => {
        const uid = useAuthStore.getState().uid;
        if (!uid || get().busy) return;
        set({ busy: true, error: null });
        try {
          await linkGooglePopup();
          await finishLink(uid);
          set({ busy: false, authModalOpen: false });
          notify("auth:saved");
        } catch (error) {
          const code = authErrorCode(error);
          if (isMergeConflict(code)) {
            const exported = await exportAnonData(uid);
            set({
              busy: false,
              authModalOpen: false,
              exported,
              mergePhase: "idle",
              pendingMerge: {
                kind: "google",
                entry: "link",
                credential: googleCredentialFromError(error),
                email: null,
                password: null,
                counts: countsOf(exported),
              },
            });
            return;
          }
          set({ busy: false, error: mapAuthError(code) });
        }
      },
      linkEmail: async (email, password) => {
        const uid = useAuthStore.getState().uid;
        if (!uid || get().busy) return;
        set({ busy: true, error: null });
        try {
          await linkEmailPassword(email, password);
          await finishLink(uid);
          set({ busy: false, authModalOpen: false });
          notify("auth:saved");
        } catch (error) {
          const code = authErrorCode(error);
          if (isMergeConflict(code)) {
            const exported = await exportAnonData(uid);
            set({
              busy: false,
              authModalOpen: false,
              exported,
              mergePhase: "idle",
              pendingMerge: {
                kind: "email",
                entry: "link",
                credential: null,
                email,
                password,
                counts: countsOf(exported),
              },
            });
            return;
          }
          set({ busy: false, error: mapAuthError(code) });
        }
      },
      signInGoogle: async () => {
        const uid = useAuthStore.getState().uid;
        if (!uid || get().busy) return;
        set({ busy: true, error: null });
        try {
          const exported = await exportAnonData(uid);
          set({
            busy: false,
            authModalOpen: false,
            exported,
            mergePhase: "idle",
            pendingMerge: {
              kind: "google",
              entry: "signin",
              credential: null,
              email: null,
              password: null,
              counts: countsOf(exported),
            },
          });
        } catch (error) {
          set({ busy: false, error: mapAuthError(authErrorCode(error)) });
        }
      },
      signInEmail: async (email, password) => {
        const uid = useAuthStore.getState().uid;
        if (!uid || get().busy) return;
        set({ busy: true, error: null });
        try {
          const exported = await exportAnonData(uid);
          if (hasMeaningfulData(exported)) {
            set({
              busy: false,
              authModalOpen: false,
              exported,
              mergePhase: "idle",
              pendingMerge: {
                kind: "email",
                entry: "signin",
                credential: null,
                email,
                password,
                counts: countsOf(exported),
              },
            });
            return;
          }
          await signInEmailPassword(email, password);
          set({ busy: false, authModalOpen: false });
        } catch (error) {
          set({ busy: false, error: mapAuthError(authErrorCode(error)) });
        }
      },
      sendReset: async (email) => {
        if (get().busy) return;
        set({ busy: true, error: null, resetSent: false });
        try {
          await sendResetEmail(email);
          set({ busy: false, resetSent: true });
        } catch (error) {
          set({ busy: false, error: mapAuthError(authErrorCode(error)) });
        }
      },
      confirmMerge: async () => {
        const pending = get().pendingMerge;
        const exported = get().exported;
        if (!pending || !exported) return;
        set({
          mergePhase: "signing-in",
          mergeError: null,
          mergeDone: 0,
          mergeTotal: 0,
        });
        try {
          const current = currentAuthUser();
          let targetUid: string;
          if (current && !current.isAnonymous) {
            targetUid = current.uid;
          } else {
            if (pending.kind === "google") {
              if (pending.credential) {
                await signInWithGoogleCredential(pending.credential);
              } else {
                await signInGooglePopup();
              }
            } else if (pending.email !== null && pending.password !== null) {
              await signInEmailPassword(pending.email, pending.password);
            } else {
              throw new Error("missing-credential");
            }
            const after = currentAuthUser();
            if (!after) throw new Error("sign-in-failed");
            targetUid = after.uid;
          }
          set({ mergePhase: "transferring" });
          await runMerge(exported, targetUid, (done, total) =>
            set({ mergeDone: done, mergeTotal: total }),
          );
          const user = currentAuthUser();
          await setAccountInfo(
            targetUid,
            user?.email ?? null,
            user?.displayName ?? null,
          );
          useAuthStore.getState().refresh();
          set({ mergePhase: "done" });
          notify("auth:merged");
        } catch (error) {
          set({
            mergePhase: "error",
            mergeError: mapAuthError(authErrorCode(error)),
          });
        }
      },
      cancelMerge: () =>
        set({ pendingMerge: null, exported: null, mergePhase: "idle" }),
      dismissMerge: () =>
        set({ pendingMerge: null, exported: null, mergePhase: "idle" }),
      openSignOut: () => set({ signOutOpen: true }),
      closeSignOut: () => set({ signOutOpen: false }),
      confirmSignOut: async () => {
        set({ signOutOpen: false });
        try {
          await signOutNow();
        } catch (error) {
          console.error(error);
        }
      },
    }),
    { name: "accountStore" },
  ),
);
