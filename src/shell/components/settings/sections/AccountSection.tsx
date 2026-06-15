import { Button, Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useAccountStore } from "../../../../state/accountStore.ts";
import { useAuthStore } from "../../../../state/authStore.ts";

export const AccountSection = () => {
  const { t } = useTranslation(["settings", "auth"]);
  const isAnonymous = useAuthStore((state) => state.isAnonymous);
  const email = useAuthStore((state) => state.email);
  const displayName = useAuthStore((state) => state.displayName);

  if (isAnonymous) {
    return (
      <Stack gap="md" align="flex-start">
        <Text c="var(--sw-ink-2)">{t("settings:accountAnonHint")}</Text>
        <Button
          color="var(--sw-accent)"
          onClick={() => useAccountStore.getState().openAuthModal("save")}
        >
          {t("auth:save")}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="md" align="flex-start">
      <Stack gap={2}>
        <Text fz="xs" fw={700} c="var(--sw-ink-3)" tt="uppercase">
          {t("settings:accountSignedIn")}
        </Text>
        {displayName && (
          <Text fw={600} c="var(--sw-ink)">
            {displayName}
          </Text>
        )}
        <Text c="var(--sw-ink-2)">{email ?? t("auth:linkedAccount")}</Text>
      </Stack>
      <Group>
        <Button
          variant="light"
          color="var(--sw-accent)"
          onClick={() => useAccountStore.getState().openSignOut()}
        >
          {t("auth:signOut.action")}
        </Button>
      </Group>
    </Stack>
  );
};
