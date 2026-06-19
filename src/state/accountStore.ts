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
  runMerge,
} from "../services/migration.ts";
import type { ExportCounts, ExportedData } from "../services/migration.ts";
import { notifySuccess } from "../services/notify.ts";
import { setAccountInfo } from "../services/repos/profileRepo.ts";
import { useAuthStore } from "./authStore.ts";

type MergeKind = "google" | "email";
type MergePhase = "idle" | "signing-in" | "transferring" | "done" | "error";

interface PendingMerge {
  kind: MergeKind;
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
  signOutOpen: boolean;
  pendingMerge: PendingMerge | null;
  exported: ExportedData | null;
  mergePhase: MergePhase;
  mergeSkip: boolean;
  mergeDone: number;
  mergeTotal: number;
  mergeError: string | null;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  clearError: () => void;
  linkGoogle: () => Promise<void>;
  linkEmail: (email: string, password: string) => Promise<void>;
  sendReset: (email: string) => Promise<void>;
  confirmMerge: () => Promise<void>;
  signInWithoutMerge: () => Promise<void>;
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

const recordAccount = async (uid: string): Promise<void> => {
  const user = currentAuthUser();
  await setAccountInfo(uid, user?.email ?? null, user?.displayName ?? null);
  useAuthStore.getState().refresh();
};

const signInForPending = async (pending: PendingMerge): Promise<string> => {
  const current = currentAuthUser();
  if (current && !current.isAnonymous) return current.uid;
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
  return after.uid;
};

export const useAccountStore = create<AccountState>()(
  devtools(
    (set, get) => ({
      busy: false,
      error: null,
      resetSent: false,
      authModalOpen: false,
      signOutOpen: false,
      pendingMerge: null,
      exported: null,
      mergePhase: "idle",
      mergeSkip: false,
      mergeDone: 0,
      mergeTotal: 0,
      mergeError: null,
      openAuthModal: () =>
        set({ authModalOpen: true, error: null, resetSent: false }),
      closeAuthModal: () => set({ authModalOpen: false }),
      clearError: () => set({ error: null }),
      linkGoogle: async () => {
        const uid = useAuthStore.getState().uid;
        if (!uid || get().busy) return;
        set({ busy: true, error: null });
        try {
          await linkGooglePopup();
          await recordAccount(uid);
          set({ busy: false, authModalOpen: false });
          notifySuccess("auth:accountSavedToast");
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
          await recordAccount(uid);
          set({ busy: false, authModalOpen: false });
          notifySuccess("auth:accountSavedToast");
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
          mergeSkip: false,
          mergePhase: "signing-in",
          mergeError: null,
          mergeDone: 0,
          mergeTotal: 0,
        });
        try {
          const targetUid = await signInForPending(pending);
          set({ mergePhase: "transferring" });
          await runMerge(exported, targetUid, (done, total) =>
            set({ mergeDone: done, mergeTotal: total }),
          );
          await recordAccount(targetUid);
          set({ mergePhase: "done" });
          notifySuccess("auth:mergeDoneToast");
        } catch (error) {
          set({
            mergePhase: "error",
            mergeError: mapAuthError(authErrorCode(error)),
          });
        }
      },
      signInWithoutMerge: async () => {
        const pending = get().pendingMerge;
        if (!pending) return;
        set({ mergeSkip: true, mergePhase: "signing-in", mergeError: null });
        try {
          const targetUid = await signInForPending(pending);
          await recordAccount(targetUid);
          set({ pendingMerge: null, exported: null, mergePhase: "idle" });
          notifySuccess("auth:signedInToast");
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
