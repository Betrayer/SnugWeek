import { Anchor, Box, Group } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useMatch } from "react-router";
import {
  currentMonthId,
  currentWeekId,
  isValidWeekId,
} from "../../services/time.ts";
import { TOUR_ANCHORS } from "../../data/tourSteps.ts";
import { useProfileStore } from "../../state/profileStore.ts";
import { AccountMenu } from "../components/account/AccountMenu.tsx";
import { HeaderFilterSlot } from "./HeaderFilterSlot.tsx";
import { HeaderSearchSlot } from "./HeaderSearchSlot.tsx";
import { SyncBadge } from "./SyncBadge.tsx";
import { ToolsMenu } from "./ToolsMenu.tsx";
import { WeekNav } from "./WeekNav.tsx";

const navLinkProps = {
  c: "var(--sw-ink-2)",
  fw: 600,
  fz: "sm",
} as const;

export const HeaderBar = () => {
  const { t } = useTranslation("common");
  const notebookName = useProfileStore((state) => state.notebookName);
  const weekMatch = useMatch("/w/:weekId");
  const weekId = weekMatch?.params.weekId;
  const onWeek = weekId !== undefined && isValidWeekId(weekId);

  return (
    <Box
      px="md"
      style={{
        height: "100%",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        columnGap: "var(--mantine-spacing-sm)",
      }}
    >
      <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
        <Anchor
          component={Link}
          to="/"
          underline="never"
          aria-label={notebookName ?? t("appName")}
          style={{ display: "flex", alignItems: "center", minWidth: 0 }}
        >
          <Box
            component="img"
            src="/favicon.svg"
            alt=""
            hiddenFrom="md"
            w={30}
            h={30}
            style={{ display: "block", borderRadius: 8 }}
          />
          <Box
            component="span"
            visibleFrom="md"
            c="var(--sw-ink)"
            ff="var(--sw-font-hand)"
            fz={28}
            fw={600}
            style={{
              minWidth: 0,
              maxWidth: 220,
              paddingInlineEnd: 6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {notebookName ?? t("appName")}
          </Box>
        </Anchor>
        <Group gap="sm" visibleFrom="md" wrap="nowrap">
          <Anchor component={Link} to={`/w/${currentWeekId()}`} {...navLinkProps}>
            {t("nav.week")}
          </Anchor>
          <Anchor
            component={Link}
            to={`/month/${currentMonthId()}`}
            data-tour={TOUR_ANCHORS.navMonth}
            {...navLinkProps}
          >
            {t("nav.month")}
          </Anchor>
          <Anchor
            component={Link}
            to="/stats"
            data-tour={TOUR_ANCHORS.navStats}
            {...navLinkProps}
          >
            {t("nav.stats")}
          </Anchor>
          <Anchor
            component={Link}
            to="/settings"
            data-tour={TOUR_ANCHORS.navSettings}
            {...navLinkProps}
          >
            {t("nav.settings")}
          </Anchor>
        </Group>
      </Group>

      {onWeek ? <WeekNav /> : <div />}

      <Group gap="xs" wrap="nowrap" justify="flex-end">
        {onWeek && <HeaderFilterSlot />}
        <Group visibleFrom="md" wrap="nowrap" gap="xs">
          <HeaderSearchSlot />
        </Group>
        <ToolsMenu onWeek={onWeek} />
        <Group visibleFrom="md" wrap="nowrap" gap="xs">
          <AccountMenu />
        </Group>
        <SyncBadge />
      </Group>
    </Box>
  );
};
