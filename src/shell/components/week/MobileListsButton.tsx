import { ActionIcon } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { TOUR_ANCHORS } from "../../../data/tourSteps.ts";
import { useListsStore } from "../../../state/listsStore.ts";
import { useUiStore } from "../../../state/uiStore.ts";

const ListsIcon = () => (
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
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r="1" />
    <circle cx="4.5" cy="12" r="1" />
    <circle cx="4.5" cy="18" r="1" />
  </svg>
);

export const MobileListsButton = () => {
  const { t } = useTranslation("tasks");
  const openCount = useListsStore((state) =>
    Object.values(state.tasksByList).reduce(
      (sum, tasks) =>
        sum + tasks.filter((task) => task.status === "open").length,
      0,
    ),
  );

  return (
    <ActionIcon
      variant="default"
      radius="xl"
      size="md"
      aria-label={t("lists.open")}
      onClick={() => useUiStore.getState().toggleSidebar()}
      data-tour={TOUR_ANCHORS.sidebar}
      style={{
        position: "absolute",
        top: "50%",
        insetInlineEnd: 6,
        transform: "translateY(-50%)",
        zIndex: 5,
        color: "var(--sw-ink-2)",
        backgroundColor: "var(--sw-card)",
        borderColor: "var(--sw-line)",
        boxShadow: "var(--sw-shadow)",
      }}
    >
      <ListsIcon />
      {openCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: -4,
            insetInlineEnd: -4,
            minWidth: 16,
            height: 16,
            paddingInline: 4,
            borderRadius: 8,
            backgroundColor: "var(--sw-accent)",
            color: "var(--sw-accent-ink)",
            fontSize: 10,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {openCount}
        </span>
      )}
    </ActionIcon>
  );
};
