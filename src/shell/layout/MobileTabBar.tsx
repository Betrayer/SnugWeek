import { UnstyledButton } from "@mantine/core";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { TOUR_ANCHORS } from "../../data/tourSteps.ts";
import { currentMonthId, currentWeekId } from "../../services/time.ts";

const WeekIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
    <path d="M9 4.5v15M15 4.5v15" />
  </svg>
);

const MonthIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
    <path d="M3.5 9.5h17M8 2.5v4M16 2.5v4" />
  </svg>
);

const StatsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 19v-7M10 19V6M15 19v-9M20 19v-5" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 7h8M18 7h2M4 17h4M14 17h6" />
    <circle cx="15" cy="7" r="2.5" />
    <circle cx="11" cy="17" r="2.5" />
  </svg>
);

const tabStyle = (active: boolean): CSSProperties => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  minHeight: 44,
  fontSize: "var(--mantine-font-size-xs)",
  fontWeight: 600,
  color: active ? "var(--sw-accent)" : "var(--sw-ink-3)",
});

export const MobileTabBar = () => {
  const { t } = useTranslation("common");
  const { pathname } = useLocation();
  const tabs = [
    {
      to: `/w/${currentWeekId()}`,
      active: pathname.startsWith("/w/"),
      label: t("nav.week"),
      icon: <WeekIcon />,
      tour: undefined,
    },
    {
      to: `/month/${currentMonthId()}`,
      active: pathname.startsWith("/month/"),
      label: t("nav.month"),
      icon: <MonthIcon />,
      tour: TOUR_ANCHORS.navMonth,
    },
    {
      to: "/stats",
      active: pathname.startsWith("/stats"),
      label: t("nav.stats"),
      icon: <StatsIcon />,
      tour: TOUR_ANCHORS.navStats,
    },
    {
      to: "/settings",
      active: pathname.startsWith("/settings"),
      label: t("nav.settings"),
      icon: <SettingsIcon />,
      tour: TOUR_ANCHORS.navSettings,
    },
  ];
  return (
    <nav style={{ display: "flex", alignItems: "stretch", height: "100%" }}>
      {tabs.map((tab) => (
        <UnstyledButton
          key={tab.to}
          component={Link}
          to={tab.to}
          data-tour={tab.tour}
          style={tabStyle(tab.active)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </UnstyledButton>
      ))}
    </nav>
  );
};
