import { ActionIcon } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useDecorStore } from "../../../state/decorStore.ts";

const BrushIcon = () => (
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
    <path d="M14 4.5 19.5 10 12 17.5l-5.5-5.5z" />
    <path d="M6.5 12 4 19.5 11.5 17" />
    <path d="M9.5 14.5 14.5 9.5" />
  </svg>
);

export const DecorateButton = () => {
  const { t } = useTranslation("decor");
  const editMode = useDecorStore((state) => state.editMode);

  return (
    <ActionIcon
      variant={editMode ? "filled" : "subtle"}
      color={editMode ? "var(--sw-accent)" : "var(--sw-ink-2)"}
      aria-label={t("decorate")}
      aria-pressed={editMode}
      onClick={() => useDecorStore.getState().toggleEdit()}
    >
      <BrushIcon />
    </ActionIcon>
  );
};
