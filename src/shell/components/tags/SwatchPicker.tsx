import { Group, UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { TAG_SWATCHES } from "../../../data/tagColors.ts";

interface SwatchPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const SwatchPicker = ({ value, onChange }: SwatchPickerProps) => {
  const { t } = useTranslation("tags");
  return (
    <Group gap={8} role="radiogroup" aria-label={t("color")}>
      {TAG_SWATCHES.map((swatch) => {
        const selected = swatch.id === value;
        return (
          <UnstyledButton
            key={swatch.id}
            role="radio"
            aria-checked={selected}
            aria-label={t(`swatch.${swatch.id}`)}
            onClick={() => onChange(swatch.id)}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: swatch.value,
              boxShadow: selected
                ? "0 0 0 2px var(--sw-paper), 0 0 0 4px var(--sw-ink-2)"
                : "none",
              transition: "box-shadow 120ms ease",
            }}
          />
        );
      })}
    </Group>
  );
};
