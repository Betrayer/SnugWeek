import { RingProgress, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface CompletionRingProps {
  completed: number;
  created: number;
}

export const CompletionRing = ({ completed, created }: CompletionRingProps) => {
  const { t } = useTranslation("stats");
  const ratio = created > 0 ? Math.min(1, completed / created) : 0;
  return (
    <Stack align="center" justify="center" gap={4} h="100%">
      <RingProgress
        size={132}
        thickness={12}
        roundCaps
        sections={[{ value: ratio * 100, color: "var(--sw-done)" }]}
        label={
          <Text ta="center" fw={700} fz="xl" c="var(--sw-ink)">
            {created > 0 ? `${Math.round(ratio * 100)}%` : "-"}
          </Text>
        }
      />
      <Text fz="sm" fw={600} c="var(--sw-ink-2)">
        {completed} / {created}
      </Text>
      <Text fz="xs" c="var(--sw-ink-3)" ta="center">
        {t("completionCaption")}
      </Text>
    </Stack>
  );
};
