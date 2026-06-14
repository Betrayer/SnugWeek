import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  currentAuthUser,
  signInAnonymouslyNow,
  subscribeAuthUser,
} from "../services/firebase.ts";

interface AuthState {
  status: "init" | "ready" | "error";
  uid: string | null;
  isAnonymous: boolean;
  email: string | null;
  displayName: string | null;
  providerIds: string[];
  bootstrap: () => void;
  retry: () => void;
  refresh: () => void;
}

let bootstrapped = false;

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      status: "init",
      uid: null,
      isAnonymous: false,
      email: null,
      displayName: null,
      providerIds: [],
      bootstrap: () => {
        if (bootstrapped) return;
        bootstrapped = true;
        subscribeAuthUser((user) => {
          if (user) {
            set({
              status: "ready",
              uid: user.uid,
              isAnonymous: user.isAnonymous,
              email: user.email,
              displayName: user.displayName,
              providerIds: user.providerIds,
            });
            return;
          }
          set({
            status: "init",
            uid: null,
            isAnonymous: false,
            email: null,
            displayName: null,
            providerIds: [],
          });
          signInAnonymouslyNow().catch((error: unknown) => {
            console.error(error);
            set({ status: "error" });
          });
        });
      },
      retry: () => {
        set({ status: "init" });
        signInAnonymouslyNow().catch((error: unknown) => {
          console.error(error);
          set({ status: "error" });
        });
      },
      refresh: () => {
        const user = currentAuthUser();
        if (!user) return;
        set({
          status: "ready",
          uid: user.uid,
          isAnonymous: user.isAnonymous,
          email: user.email,
          displayName: user.displayName,
          providerIds: user.providerIds,
        });
      },
    }),
    { name: "authStore" },
  ),
);
