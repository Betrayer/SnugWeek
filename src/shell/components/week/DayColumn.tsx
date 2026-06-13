import { Box, Button, Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { WeekDay } from "../../../services/time.ts";
import { DayHeader } from "./DayHeader.tsx";

interface DayColumnProps {
  day: WeekDay;
  isOff: boolean;
}

export const DayColumn = ({ day, isOff }: DayColumnProps) => {
  const { t } = useTranslation("tasks");
  return (
    <Stack
      gap="xs"
      style={{
        backgroundColor: isOff ? "var(--sw-paper-2)" : "var(--sw-card)",
        border: "1px solid var(--sw-line)",
        borderRadius: "var(--mantine-radius-lg)",
        padding: "var(--mantine-spacing-sm)",
        boxShadow: "var(--sw-shadow)",
        minHeight: 220,
      }}
    >
      <DayHeader day={day} isOff={isOff} />
      <Box style={{ flex: 1, minHeight: 120 }} />
      <Button variant="subtle" size="compact-sm" c="var(--sw-ink-3)" disabled>
        + {t("add")}
      </Button>
    </Stack>
  );
};
