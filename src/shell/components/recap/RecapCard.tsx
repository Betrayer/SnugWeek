import {
  ActionIcon,
  Card,
  Group,
  RingProgress,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { WeekRecap } from "../../../services/recap/weeklyRecap.ts";
import { MOOD_EMOJIS } from "../../../services/stats/moodScale.ts";
import { MugDoodle, SparkleDoodle } from "../common/doodles.tsx";
import { CloseGlyph } from "../icons/glyphs.tsx";

interface RecapCardProps {
  recap: WeekRecap;
  onDismiss?: () => void;
  elevated?: boolean;
}

interface RecapFactProps {
  value: string;
  caption: string;
}

const RecapFact = ({ value, caption }: RecapFactProps) => (
  <Stack gap={0} align="center" justify="center">
    <Text
      ff="var(--sw-font-hand)"
      fz={30}
      fw={700}
      c="var(--sw-accent)"
      lh={1.1}
    >
      {value}
    </Text>
    <Text fz="xs" c="var(--sw-ink-3)" ta="center" lineClamp={1}>
      {caption}
    </Text>
  </Stack>
);

export const RecapCard = ({ recap, onDismiss, elevated }: RecapCardProps) => {
  const { t } = useTranslation("recap");

  const moodEmoji =
    recap.moodAvg !== null
      ? (MOOD_EMOJIS[
        Math.min(4, Math.max(0, Math.round(recap.moodAvg) - 1))
      ] ?? "")
      : "";

  const facts: RecapFactProps[] = [];
  if (recap.moodAvg !== null) {
    facts.push({
      value: `${moodEmoji} ${recap.moodAvg.toFixed(1)}`.trim(),
      caption: t("moodLabel"),
    });
  }
  if (recap.energyAvg !== null) {
    facts.push({
      value: recap.energyAvg.toFixed(1),
      caption: t("energyLabel"),
    });
  }
  if (recap.bestStreak !== null) {
    facts.push({
      value: String(recap.bestStreak),
      caption: t("streakLabel"),
    });
  }
  if (recap.topHabit !== null) {
    facts.push({
      value: `${recap.topHabit.checked}/7`,
      caption: recap.topHabit.name || t("topHabitLabel"),
    });
  }

  return (
    <Card
      withBorder
      radius="lg"
      padding="lg"
      shadow={elevated ? "md" : undefined}
      style={{ borderColor: "var(--sw-line)", backgroundColor: "var(--sw-card)" }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap={6} wrap="nowrap">
            <span aria-hidden style={{ color: "var(--sw-accent)", lineHeight: 0 }}>
              <SparkleDoodle size={22} />
            </span>
            <Text ff="var(--sw-font-hand)" fz="xl" c="var(--sw-ink)">
              {t("thisWeek")}
            </Text>
          </Group>
          {onDismiss && (
            <ActionIcon
              variant="subtle"
              color="var(--sw-ink-3)"
              aria-label={t("dismiss")}
              onClick={onDismiss}
            >
              <CloseGlyph size={18} strokeWidth={1.8} />
            </ActionIcon>
          )}
        </Group>

        {recap.hasContent ? (
          <>
            <Group gap="lg" align="center" wrap="wrap">
              <RingProgress
                size={120}
                thickness={11}
                roundCaps
                sections={[
                  {
                    value: recap.completionPct * 100,
                    color: "var(--sw-done)",
                  },
                ]}
                label={
                  <Stack gap={0} align="center">
                    <Text ta="center" fw={700} fz="lg" c="var(--sw-ink)">
                      {recap.total > 0
                        ? `${Math.round(recap.completionPct * 100)}%`
                        : "-"}
                    </Text>
                    <Text ta="center" fz="xs" c="var(--sw-ink-3)">
                      {recap.completed}/{recap.total}
                    </Text>
                  </Stack>
                }
              />
              {facts.length > 0 && (
                <SimpleGrid
                  cols={{ base: 2, xs: facts.length > 2 ? 2 : facts.length }}
                  spacing="md"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  {facts.map((fact) => (
                    <RecapFact
                      key={fact.caption}
                      value={fact.value}
                      caption={fact.caption}
                    />
                  ))}
                </SimpleGrid>
              )}
            </Group>
            <Text ff="var(--sw-font-hand)" fz="lg" c="var(--sw-ink-2)" ta="center">
              {t(`close.${recap.tone}`, { done: recap.completed })}
            </Text>
          </>
        ) : (
          <Stack gap={6} align="center" style={{ textAlign: "center" }}>
            <span aria-hidden style={{ color: "var(--sw-ink-3)", lineHeight: 0 }}>
              <MugDoodle size={40} />
            </span>
            <Text ff="var(--sw-font-hand)" fz="lg" c="var(--sw-ink-2)">
              {t("close.quiet")}
            </Text>
          </Stack>
        )}
      </Stack>
    </Card>
  );
};
