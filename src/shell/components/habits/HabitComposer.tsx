import { Button, TextInput } from "@mantine/core";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { useHabitsStore } from "../../../state/habitsStore.ts";
import { inputFieldStyles } from "../../styles/fieldStyles.ts";

const MAX_NAME = 60;

export const HabitComposer = () => {
  const { t } = useTranslation("habits");
  const [active, setActive] = useState(false);
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    useHabitsStore.getState().add(trimmed, null);
    setValue("");
    setActive(false);
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
        onClick={() => setActive(true)}
        style={{ fontWeight: 600, alignSelf: "flex-start" }}
      >
        + {t("add")}
      </Button>
    );
  }

  return (
    <TextInput
      autoFocus
      size="sm"
      value={value}
      maxLength={MAX_NAME}
      aria-label={t("add")}
      placeholder={t("namePlaceholder")}
      onChange={(event) => setValue(event.currentTarget.value)}
      onKeyDown={handleKey}
      onBlur={() => {
        if (value.trim().length === 0) setActive(false);
      }}
      style={{ maxWidth: 260 }}
      styles={inputFieldStyles}
    />
  );
};
