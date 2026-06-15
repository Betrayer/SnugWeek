import { Box, Button, Text, TextInput } from "@mantine/core";
import { useState } from "react";
import type { KeyboardEvent } from "react";

interface AddControlProps {
  label: string;
  placeholder: string;
  onAdd: (value: string) => void;
  maxLength: number;
  chained?: boolean;
  counterFrom?: number;
  dataDay?: number;
}

export const AddControl = ({
  label,
  placeholder,
  onAdd,
  maxLength,
  chained = false,
  counterFrom,
  dataDay,
}: AddControlProps) => {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    onAdd(trimmed);
    setValue("");
    if (!chained) setActive(false);
  };

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setValue("");
      setActive(false);
    }
  };

  if (!active) {
    return (
      <Button
        variant="subtle"
        size="compact-sm"
        c="var(--sw-ink-3)"
        justify="flex-start"
        fullWidth
        onClick={() => setActive(true)}
        data-sw-add-day={dataDay}
        style={{ fontWeight: 600 }}
      >
        + {label}
      </Button>
    );
  }

  return (
    <Box>
      <TextInput
        autoFocus
        size="sm"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-label={label}
        data-sw-add-day={dataDay}
        onChange={(event) => setValue(event.currentTarget.value)}
        onKeyDown={handleKey}
        onBlur={() => {
          if (value.trim().length === 0) setActive(false);
        }}
        styles={{
          input: {
            backgroundColor: "var(--sw-card)",
            borderColor: "var(--sw-line)",
            color: "var(--sw-ink)",
            "--input-placeholder-color": "var(--sw-ink-3)",
          },
        }}
      />
      {counterFrom !== undefined && value.length > counterFrom && (
        <Text fz="xs" c="var(--sw-ink-3)" ta="right" mt={2}>
          {value.length}/{maxLength}
        </Text>
      )}
    </Box>
  );
};
