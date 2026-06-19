import { useEffect } from "react";
import { useFocusStore } from "../../state/focusStore.ts";

export const useFocusTicker = (): void => {
  const status = useFocusStore((state) => state.status);

  useEffect(() => {
    useFocusStore.getState().reconcile();
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    const check = () => {
      const state = useFocusStore.getState();
      if (
        state.status === "running" &&
        state.endsAt !== null &&
        Date.now() >= state.endsAt
      ) {
        state.finish();
      }
    };
    const id = window.setInterval(check, 250);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    };
  }, [status]);
};
