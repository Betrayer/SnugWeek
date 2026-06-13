import { Box, Button, Text, TextInput } from "@mantine/core";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

interface TaskComposerProps {
  onAdd: (title: string) => void;
  placeholder?: string;
}

const MAX_TITLE = 500;
const COUNTER_FROM = 400;

export const TaskComposer = ({ onAdd, placeholder }: TaskComposerProps) => {
  const { t } = useTranslation("tasks");
  const [active, setActive] = useState(false);
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    onAdd(trimmed);
    setValue("");
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
        style={{ fontWeight: 600 }}
      >
        + {t("add")}
      </Button>
    );
  }

  return (
    <Box>
      <TextInput
        autoFocus
        size="sm"
        value={value}
        maxLength={MAX_TITLE}
        placeholder={placeholder ?? t("composerPlaceholder")}
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
      {value.length > COUNTER_FROM && (
        <Text fz="xs" c="var(--sw-ink-3)" ta="right" mt={2}>
          {t("charLimit", { n: value.length })}
        </Text>
      )}
    </Box>
  );
};
