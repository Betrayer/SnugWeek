import { TimePicker } from "@mantine/dates";
import type { CSSProperties } from "react";
import { fieldStyles } from "../../styles/fieldStyles.ts";

const DEFAULT_PRESETS = ["09:00", "12:00", "15:00", "18:00", "21:00"];

interface TimeFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  presets?: string[];
  clearable?: boolean;
  style?: CSSProperties;
}

export const TimeField = ({
  value,
  onChange,
  label,
  presets = DEFAULT_PRESETS,
  clearable = true,
  style,
}: TimeFieldProps) => (
  <TimePicker
    label={label}
    value={value ?? ""}
    onChange={(next) => onChange(next ? next.slice(0, 5) : null)}
    withDropdown
    withSeconds={false}
    format="24h"
    clearable={clearable}
    presets={presets}
    popoverProps={{ withinPortal: true, zIndex: 320 }}
    styles={fieldStyles}
    style={style}
  />
);
