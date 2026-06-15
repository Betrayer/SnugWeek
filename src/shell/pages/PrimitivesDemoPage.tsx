import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ActionMenu } from "../components/common/ActionMenu.tsx";
import { BottomSheet } from "../components/common/BottomSheet.tsx";
import { ComingSoon } from "../components/common/ComingSoon.tsx";
import { EmptyState } from "../components/common/EmptyState.tsx";
import { ResponsiveDialog } from "../components/common/ResponsiveDialog.tsx";
import { SkeletonBlock } from "../components/common/SkeletonBlock.tsx";
import { SparkleDoodle } from "../components/common/doodles.tsx";

export const PrimitivesDemoPage = () => {
  const [sheet, sheetHandlers] = useDisclosure(false);
  const [dialog, dialogHandlers] = useDisclosure(false);

  return (
    <Stack gap="xl" maw={560} pb="xl">
      <Title order={2} c="var(--sw-ink)">
        Primitives
      </Title>

      <Stack gap="xs">
        <Text fw={600}>ActionMenu</Text>
        <Group>
          <ActionMenu
            label="Demo actions"
            actions={[
              { key: "edit", label: "Edit", onClick: () => {} },
              {
                key: "delete",
                label: "Delete",
                danger: true,
                onClick: () => {},
                confirm: {
                  title: "Delete this?",
                  body: "This cannot be undone.",
                  confirmLabel: "Delete",
                },
              },
            ]}
          />
        </Group>
      </Stack>

      <Stack gap="xs">
        <Text fw={600}>BottomSheet / ResponsiveDialog</Text>
        <Group>
          <Button variant="light" onClick={sheetHandlers.open}>
            Open BottomSheet
          </Button>
          <Button variant="light" onClick={dialogHandlers.open}>
            Open ResponsiveDialog
          </Button>
        </Group>
      </Stack>

      <Stack gap="xs">
        <Text fw={600}>SkeletonBlock</Text>
        <SkeletonBlock count={3} />
      </Stack>

      <Stack gap="xs">
        <Text fw={600}>EmptyState</Text>
        <EmptyState icon={<SparkleDoodle />} label="nothing here yet" />
      </Stack>

      <Stack gap="xs">
        <Text fw={600}>ComingSoon</Text>
        <ComingSoon label="A future feature" hint="lands in a later phase" />
      </Stack>

      <BottomSheet opened={sheet} onClose={sheetHandlers.close} title="A sheet">
        <Text c="var(--sw-ink-2)">Bottom sheet content.</Text>
      </BottomSheet>

      <ResponsiveDialog
        opened={dialog}
        onClose={dialogHandlers.close}
        title="A dialog"
      >
        <Text c="var(--sw-ink-2)">
          Renders as a centered modal on desktop and a bottom sheet on mobile.
        </Text>
      </ResponsiveDialog>
    </Stack>
  );
};
