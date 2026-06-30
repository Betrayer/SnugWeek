import {
  Chip,
  Group,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DECORATIONS, assetCategory } from "../../../data/decorations.tsx";
import type { DecorationAsset } from "../../../data/decorations.tsx";
import { DECORATION_CATEGORIES } from "../../../data/decorationCategories.ts";
import type { DecorationCategory } from "../../../data/decorationCategories.ts";
import { weekDays } from "../../../services/time.ts";
import { useDecorStore } from "../../../state/decorStore.ts";
import { useSettingsStore } from "../../../state/settingsStore.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";
import { DecorationArt } from "./DecorationArt.tsx";

const ASSET_BUTTON_HEIGHT = 52;

export const DecorationPalette = () => {
  const { t } = useTranslation("decor");
  const opened = useDecorStore((state) => state.paletteOpen);
  const target = useDecorStore((state) => state.target);
  const weekId = useWeekStore((state) => state.weekId);
  const language = useSettingsStore((state) => state.language);
  const [category, setCategory] = useState<DecorationCategory | "all">("all");
  const [query, setQuery] = useState("");

  const days = useMemo(
    () => (weekId ? weekDays(weekId, language) : []),
    [weekId, language],
  );

  const targetData = [
    { value: "week", label: t("targetWeek") },
    ...days.map((day) => ({ value: String(day.iso), label: day.label })),
  ];

  const presentCategories = useMemo(
    () =>
      DECORATION_CATEGORIES.filter((cat) =>
        DECORATIONS.some((asset) => assetCategory(asset) === cat),
      ),
    [],
  );

  const trimmed = query.trim().toLowerCase();
  const matches = useMemo(() => {
    return DECORATIONS.filter((asset) => {
      const cat = assetCategory(asset);
      if (category !== "all" && cat !== category) return false;
      if (trimmed.length === 0) return true;
      const label = t(`category.${cat}`).toLowerCase();
      return asset.id.toLowerCase().includes(trimmed) || label.includes(trimmed);
    });
  }, [category, trimmed, t]);

  const grouped = category === "all" && trimmed.length === 0;

  const pick = (asset: DecorationAsset) => {
    useWeekStore.getState().addDecoration(asset.id, asset.kind);
    useDecorStore.getState().closePalette();
  };

  const assetButton = (asset: DecorationAsset) => (
    <UnstyledButton
      key={asset.id}
      onClick={() => pick(asset)}
      aria-label={t("addAsset", { kind: t(`kind.${asset.kind}`) })}
      style={{
        width: asset.kind === "washi" ? 92 : 56,
        height: ASSET_BUTTON_HEIGHT,
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
  );

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
        <TextInput
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder={t("filterPlaceholder")}
          aria-label={t("filterPlaceholder")}
        />
        <ScrollArea.Autosize
          type="hover"
          scrollbarSize={8}
          mx="calc(var(--mantine-spacing-md) * -1)"
        >
          <Chip.Group
            value={category}
            onChange={(value) =>
              setCategory((value as DecorationCategory | "all") || "all")
            }
          >
            <Group gap={6} wrap="nowrap" px="md">
              <Chip value="all" size="sm" color="var(--sw-accent)" variant="light">
                {t("allCategory")}
              </Chip>
              {presentCategories.map((cat) => (
                <Chip
                  key={cat}
                  value={cat}
                  size="sm"
                  color="var(--sw-accent)"
                  variant="light"
                >
                  {t(`category.${cat}`)}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        </ScrollArea.Autosize>
        <div style={{ maxHeight: "min(46vh, 420px)", overflowY: "auto" }}>
          {matches.length === 0 ? (
            <Text fz="sm" c="var(--sw-ink-3)" ta="center" py="lg">
              {t("noMatches")}
            </Text>
          ) : grouped ? (
            <Stack gap="md">
              {presentCategories.map((cat) => {
                const items = matches.filter(
                  (asset) => assetCategory(asset) === cat,
                );
                if (items.length === 0) return null;
                return (
                  <Stack key={cat} gap={6}>
                    <Text
                      ff="var(--sw-font-hand)"
                      fz="lg"
                      fw={600}
                      c="var(--sw-ink-2)"
                    >
                      {t(`category.${cat}`)}
                    </Text>
                    <Group gap="xs">{items.map(assetButton)}</Group>
                  </Stack>
                );
              })}
            </Stack>
          ) : (
            <Group gap="xs">{matches.map(assetButton)}</Group>
          )}
        </div>
      </Stack>
    </ResponsiveDialog>
  );
};
