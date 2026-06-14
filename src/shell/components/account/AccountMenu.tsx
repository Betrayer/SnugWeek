import { Avatar, Button, Menu, Stack, Text, UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useAccountStore } from "../../../state/accountStore.ts";
import { useAuthStore } from "../../../state/authStore.ts";

const initialOf = (
  displayName: string | null,
  email: string | null,
): string => {
  const source = displayName ?? email ?? "";
  return source.length > 0 ? source.charAt(0).toUpperCase() : "•";
};

export const AccountMenu = () => {
  const { t } = useTranslation("auth");
  const isAnonymous = useAuthStore((state) => state.isAnonymous);
  const uid = useAuthStore((state) => state.uid);
  const email = useAuthStore((state) => state.email);
  const displayName = useAuthStore((state) => state.displayName);

  if (!uid) return null;

  if (isAnonymous) {
    return (
      <Button
        variant="light"
        size="compact-sm"
        radius="xl"
        color="var(--sw-accent)"
        onClick={() => useAccountStore.getState().openAuthModal("save")}
      >
        {t("save")}
      </Button>
    );
  }

  return (
    <Menu position="bottom-end" radius="md" width={240}>
      <Menu.Target>
        <UnstyledButton aria-label={t("menuLabel")}>
          <Avatar
            radius="xl"
            size={32}
            styles={{
              placeholder: {
                backgroundColor: "var(--sw-accent)",
                color: "var(--sw-accent-ink)",
                fontWeight: 700,
              },
            }}
          >
            {initialOf(displayName, email)}
          </Avatar>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Stack gap={2} px="sm" py="xs">
          {displayName && (
            <Text fz="sm" fw={600} c="var(--sw-ink)" truncate>
              {displayName}
            </Text>
          )}
          <Text fz="xs" c="var(--sw-ink-3)" truncate>
            {email ?? t("linkedAccount")}
          </Text>
        </Stack>
        <Menu.Divider />
        <Menu.Item onClick={() => useAccountStore.getState().openSignOut()}>
          {t("signOut.action")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
