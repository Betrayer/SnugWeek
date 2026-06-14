import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useAccountStore } from "../../../state/accountStore.ts";

export const SignOutDialog = () => {
  const { t } = useTranslation("auth");
  const open = useAccountStore((state) => state.signOutOpen);

  return (
    <Modal
      opened={open}
      onClose={() => useAccountStore.getState().closeSignOut()}
      title={
        <Text ff="var(--sw-font-hand)" fz={26} fw={600} c="var(--sw-ink)">
          {t("signOut.title")}
        </Text>
      }
      centered
      radius="lg"
      styles={{ content: { backgroundColor: "var(--sw-paper)" } }}
    >
      <Stack gap="md">
        <Text fz="sm" c="var(--sw-ink-2)">
          {t("signOut.body")}
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button
            variant="subtle"
            color="var(--sw-ink-2)"
            onClick={() => useAccountStore.getState().closeSignOut()}
          >
            {t("signOut.cancel")}
          </Button>
          <Button
            color="var(--sw-danger)"
            onClick={() => void useAccountStore.getState().confirmSignOut()}
          >
            {t("signOut.confirm")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
