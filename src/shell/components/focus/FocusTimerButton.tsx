import { ActionIcon } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useFocusStore } from "../../../state/focusStore.ts";

const TimerIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 13.5V9M9.5 2.5h5" />
  </svg>
);

export const FocusTimerButton = () => {
  const { t } = useTranslation("focus");
  const panelOpen = useFocusStore((state) => state.panelOpen);
  const running = useFocusStore((state) => state.status === "running");

  return (
    <ActionIcon
      variant={panelOpen ? "filled" : "subtle"}
      color={panelOpen ? "var(--sw-accent)" : "var(--sw-ink-2)"}
      aria-label={t("open")}
      aria-pressed={panelOpen}
      onClick={() => useFocusStore.getState().togglePanel()}
      style={{ position: "relative" }}
    >
      <TimerIcon />
      {running && !panelOpen && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 2,
            insetInlineEnd: 2,
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: "var(--sw-accent)",
          }}
        />
      )}
    </ActionIcon>
  );
};
