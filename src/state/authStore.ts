import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  signInAnonymouslyNow,
  subscribeAuthUser,
} from "../services/firebase.ts";

interface AuthState {
  status: "init" | "ready";
  uid: string | null;
  isAnonymous: boolean;
  bootstrap: () => void;
}

let bootstrapped = false;

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      status: "init",
      uid: null,
      isAnonymous: false,
      bootstrap: () => {
        if (bootstrapped) return;
        bootstrapped = true;
        subscribeAuthUser((user) => {
          if (user) {
            set({
              status: "ready",
              uid: user.uid,
              isAnonymous: user.isAnonymous,
            });
            return;
          }
          set({ status: "init", uid: null, isAnonymous: false });
          signInAnonymouslyNow().catch((error: unknown) => {
            console.error(error);
          });
        });
      },
    }),
    { name: "authStore" },
  ),
);
