import { ActionIcon, Anchor, Box, Group } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useMatch } from "react-router";
import {
  currentMonthId,
  currentWeekId,
  isValidWeekId,
} from "../../services/time.ts";
import { useListsStore } from "../../state/listsStore.ts";
import { useProfileStore } from "../../state/profileStore.ts";
import { useUiStore } from "../../state/uiStore.ts";
import { AccountMenu } from "../components/account/AccountMenu.tsx";
import { DecorateButton } from "../components/decor/DecorateButton.tsx";
import { FocusTimerButton } from "../components/focus/FocusTimerButton.tsx";
import { HeaderFilterSlot } from "./HeaderFilterSlot.tsx";
import { HeaderSearchSlot } from "./HeaderSearchSlot.tsx";
import { LanguageMenu } from "./LanguageMenu.tsx";
import { SyncBadge } from "./SyncBadge.tsx";
import { WeekNav } from "./WeekNav.tsx";

const ListsIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r="1" />
    <circle cx="4.5" cy="12" r="1" />
    <circle cx="4.5" cy="18" r="1" />
  </svg>
);

const navLinkProps = {
  c: "var(--sw-ink-2)",
  fw: 600,
  fz: "sm",
} as const;

export const HeaderBar = () => {
  const { t } = useTranslation(["common", "week", "tasks"]);
  const notebookName = useProfileStore((state) => state.notebookName);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const listOpenCount = useListsStore((state) =>
    Object.values(state.tasksByList).reduce(
      (sum, tasks) =>
        sum + tasks.filter((task) => task.status === "open").length,
      0,
    ),
  );
  const weekMatch = useMatch("/w/:weekId");
  const weekId = weekMatch?.params.weekId;
  const onWeek = weekId !== undefined && isValidWeekId(weekId);

  return (
    <Box
      px="md"
      style={{
        height: "100%",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
        alignItems: "center",
        columnGap: "var(--mantine-spacing-sm)",
      }}
    >
      <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
        <Anchor
          component={Link}
          to="/"
          underline="never"
          c="var(--sw-ink)"
          ff="var(--sw-font-hand)"
          fz={28}
          fw={600}
          visibleFrom="sm"
          style={{
            maxWidth: 220,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {notebookName ?? t("common:appName")}
        </Anchor>
        <Group gap="sm" visibleFrom="md" wrap="nowrap">
          <Anchor component={Link} to={`/w/${currentWeekId()}`} {...navLinkProps}>
            {t("common:nav.week")}
          </Anchor>
          <Anchor
            component={Link}
            to={`/month/${currentMonthId()}`}
            {...navLinkProps}
          >
            {t("common:nav.month")}
          </Anchor>
          <Anchor component={Link} to="/stats" {...navLinkProps}>
            {t("common:nav.stats")}
          </Anchor>
          <Anchor component={Link} to="/settings" {...navLinkProps}>
            {t("common:nav.settings")}
          </Anchor>
        </Group>
      </Group>

      {onWeek ? <WeekNav /> : <div />}

      <Group gap="sm" wrap="nowrap" justify="flex-end" style={{ minWidth: 0 }}>
        {onWeek && <HeaderFilterSlot />}
        {onWeek && <DecorateButton />}
        <FocusTimerButton />
        <HeaderSearchSlot />
        {onWeek && (
          <ActionIcon
            hiddenFrom="md"
            variant="subtle"
            color="var(--sw-ink-2)"
            aria-label={t("tasks:lists.open")}
            onClick={toggleSidebar}
            style={{ position: "relative" }}
          >
            <ListsIcon />
            {listOpenCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  insetInlineEnd: -2,
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
                {listOpenCount}
              </span>
            )}
          </ActionIcon>
        )}
        <SyncBadge />
        <Group visibleFrom="md">
          <LanguageMenu />
        </Group>
        <AccountMenu />
      </Group>
    </Box>
  );
};
