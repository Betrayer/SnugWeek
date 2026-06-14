import { ActionIcon, Anchor, Button, Group, Menu } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useMatch } from "react-router";
import { SUPPORTED_LANGS } from "../../i18n/languages.ts";
import { currentMonthId, currentWeekId, isValidWeekId } from "../../services/time.ts";
import { useListsStore } from "../../state/listsStore.ts";
import { useSettingsStore } from "../../state/settingsStore.ts";
import { useUiStore } from "../../state/uiStore.ts";
import { AccountMenu } from "../components/account/AccountMenu.tsx";
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

export const HeaderBar = () => {
  const { t } = useTranslation(["common", "week", "tasks"]);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
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
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Anchor
        component={Link}
        to="/"
        underline="never"
        c="var(--sw-ink)"
        ff="var(--sw-font-hand)"
        fz={28}
        fw={600}
        visibleFrom="sm"
      >
        {t("common:appName")}
      </Anchor>
      {onWeek && <WeekNav />}
      <Group gap="sm" wrap="nowrap">
        <Group gap="sm" visibleFrom="md">
          <Anchor
            component={Link}
            to={`/w/${currentWeekId()}`}
            c="var(--sw-ink-2)"
            fw={600}
            fz="sm"
          >
            {t("common:nav.week")}
          </Anchor>
          <Anchor
            component={Link}
            to={`/month/${currentMonthId()}`}
            c="var(--sw-ink-2)"
            fw={600}
            fz="sm"
          >
            {t("common:nav.month")}
          </Anchor>
          <Anchor
            component={Link}
            to="/stats"
            c="var(--sw-ink-2)"
            fw={600}
            fz="sm"
          >
            {t("common:nav.stats")}
          </Anchor>
          <Anchor
            component={Link}
            to="/settings"
            c="var(--sw-ink-2)"
            fw={600}
            fz="sm"
          >
            {t("common:nav.settings")}
          </Anchor>
        </Group>
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
        <Menu position="bottom-end">
          <Menu.Target>
            <Button variant="subtle" size="compact-sm" c="var(--sw-ink-2)">
              {language.toUpperCase()}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {SUPPORTED_LANGS.map((lang) => (
              <Menu.Item
                key={lang}
                onClick={() => setLanguage(lang)}
                rightSection={lang === language ? "✓" : null}
              >
                {t(`common:languageNames.${lang}`)}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
        <AccountMenu />
      </Group>
    </Group>
  );
};
