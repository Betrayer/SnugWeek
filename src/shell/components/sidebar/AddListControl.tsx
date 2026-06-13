import { Button, TextInput } from "@mantine/core";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { useListsStore } from "../../../state/listsStore.ts";

const MAX_NAME = 120;

export const AddListControl = () => {
  const { t } = useTranslation("tasks");
  const [active, setActive] = useState(false);
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    useListsStore.getState().addList(trimmed);
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
        fullWidth
        onClick={() => setActive(true)}
        style={{ fontWeight: 600 }}
      >
        + {t("lists.add")}
      </Button>
    );
  }

  return (
    <TextInput
      autoFocus
      size="sm"
      value={value}
      maxLength={MAX_NAME}
      placeholder={t("lists.namePlaceholder")}
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
  );
};
