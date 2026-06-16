import { Button, Group, Stack, TextInput } from "@mantine/core";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";
import { faviconUrl, hostnameOf, normalizeUrl } from "./format.ts";

interface LinkDialogProps {
  opened: boolean;
  onClose: () => void;
  onAdd: (fields: { href: string; title: string; previewImage: string | null }) => void;
}

export const LinkDialog = ({ opened, onClose, onAdd }: LinkDialogProps) => {
  const { t } = useTranslation(["attachments", "common"]);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const close = () => {
    setValue("");
    setError(false);
    onClose();
  };

  const submit = () => {
    const href = normalizeUrl(value);
    if (!href) {
      setError(true);
      return;
    }
    onAdd({ href, title: hostnameOf(href), previewImage: faviconUrl(href) });
    close();
  };

  const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  return (
    <ResponsiveDialog opened={opened} onClose={close} title={t("linkDialog.title")}>
      <Stack gap="md">
        <TextInput
          type="url"
          value={value}
          autoFocus
          placeholder={t("linkDialog.placeholder")}
          error={error ? t("linkDialog.invalid") : undefined}
          onChange={(event) => {
            setValue(event.currentTarget.value);
            if (error) setError(false);
          }}
          onKeyDown={onKey}
          styles={{
            input: {
              backgroundColor: "var(--sw-card)",
              borderColor: "var(--sw-line)",
              color: "var(--sw-ink)",
            },
          }}
        />
        <Group justify="flex-end">
          <Button variant="subtle" c="var(--sw-ink-2)" onClick={close}>
            {t("common:cancel")}
          </Button>
          <Button color="var(--sw-accent)" onClick={submit}>
            {t("linkDialog.action")}
          </Button>
        </Group>
      </Stack>
    </ResponsiveDialog>
  );
};
