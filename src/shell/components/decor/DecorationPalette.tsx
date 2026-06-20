import { Group, Select, Stack, Text, UnstyledButton } from "@mantine/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  DECORATIONS,
  DECORATION_KINDS,
} from "../../../data/decorations.tsx";
import type { DecorationAsset } from "../../../data/decorations.tsx";
import { weekDays } from "../../../services/time.ts";
import { useDecorStore } from "../../../state/decorStore.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";
import { DecorationArt } from "./DecorationArt.tsx";

export const DecorationPalette = () => {
  const { t } = useTranslation("decor");
  const opened = useDecorStore((state) => state.paletteOpen);
  const target = useDecorStore((state) => state.target);
  const weekId = useWeekStore((state) => state.weekId);
  const language = useSettingsStore((state) => state.language);

  const days = useMemo(
    () => (weekId ? weekDays(weekId, language) : []),
    [weekId, language],
  );

  const targetData = [
    { value: "week", label: t("targetWeek") },
    ...days.map((day) => ({ value: String(day.iso), label: day.label })),
  ];

  const pick = (asset: DecorationAsset) => {
    useWeekStore.getState().addDecoration(asset.id, asset.kind);
    useDecorStore.getState().closePalette();
  };

  return (
    <ResponsiveDialog
      opened={opened}
      onClose={() => useDecorStore.getState().closePalette()}
      title={t("paletteTitle")}
    >
      <Stack gap="md" data-hint="decorations">
        <Select
          label={t("target")}
          data={targetData}
          value={String(target)}
          onChange={(value) => {
            if (!value) return;
            useDecorStore
              .getState()
              .setTarget(value === "week" ? "week" : Number(value));
          }}
          allowDeselect={false}
          comboboxProps={{ withinPortal: true }}
        />
        {DECORATION_KINDS.map((kind) => (
          <Stack key={kind} gap={6}>
            <Text ff="var(--sw-font-hand)" fz="lg" fw={600} c="var(--sw-ink-2)">
              {t(`kindPlural.${kind}`)}
            </Text>
            <Group gap="xs">
              {DECORATIONS.filter((asset) => asset.kind === kind).map(
                (asset) => (
                  <UnstyledButton
                    key={asset.id}
                    onClick={() => pick(asset)}
                    aria-label={t("addAsset", { kind: t(`kind.${kind}`) })}
                    style={{
                      width: kind === "washi" ? 92 : 56,
                      height: 52,
                      padding: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "var(--mantine-radius-md)",
                      border: "1px solid var(--sw-line)",
                      backgroundColor: "var(--sw-card)",
                    }}
                  >
                    <DecorationArt assetId={asset.id} />
                  </UnstyledButton>
                ),
              )}
            </Group>
          </Stack>
        ))}
      </Stack>
    </ResponsiveDialog>
  );
};
