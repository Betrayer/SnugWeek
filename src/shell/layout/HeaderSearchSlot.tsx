import { ActionIcon, Tooltip } from "@mantine/core";
import { spotlight } from "@mantine/spotlight";
import { useTranslation } from "react-i18next";

const SearchIcon = () => (
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
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4 4" />
  </svg>
);

export const HeaderSearchSlot = () => {
  const { t } = useTranslation("common");
  return (
    <Tooltip label={t("search")} withArrow>
      <ActionIcon
        variant="subtle"
        color="var(--sw-ink-2)"
        aria-label={t("search")}
        onClick={() => spotlight.open()}
      >
        <SearchIcon />
      </ActionIcon>
    </Tooltip>
  );
};
