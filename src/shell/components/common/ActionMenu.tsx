import {
  ActionIcon,
  Button,
  Group,
  Menu,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../../hooks/useIsMobile.ts";
import { BottomSheet } from "./BottomSheet.tsx";
import { ResponsiveDialog } from "./ResponsiveDialog.tsx";

interface ConfirmConfig {
  title: string;
  body: string;
  confirmLabel: string;
}

export interface ActionItem {
  key: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  rightSection?: ReactNode;
  confirm?: ConfirmConfig;
}

interface ActionMenuProps {
  label: string;
  actions: ActionItem[];
  iconSize?: number;
  triggerColor?: string;
  triggerSize?: string;
  triggerStyle?: CSSProperties;
  stopPropagation?: boolean;
}

const KebabIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <circle cx="12" cy="5" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="12" cy="19" r="1.7" />
  </svg>
);

export const ActionMenu = ({
  label,
  actions,
  iconSize = 18,
  triggerColor = "var(--sw-ink-3)",
  triggerSize = "sm",
  triggerStyle,
  stopPropagation = false,
}: ActionMenuProps) => {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
  const [sheetOpened, setSheetOpened] = useState(false);
  const [confirming, setConfirming] = useState<ActionItem | null>(null);

  const guard = stopPropagation
    ? {
        onPointerDown: (event: { stopPropagation: () => void }) =>
          event.stopPropagation(),
        onKeyDown: (event: { stopPropagation: () => void }) =>
          event.stopPropagation(),
      }
    : {};

  const run = (action: ActionItem) => {
    setSheetOpened(false);
    if (action.confirm) {
      setConfirming(action);
      return;
    }
    action.onClick();
  };

  const confirmNow = () => {
    const action = confirming;
    setConfirming(null);
    if (action) action.onClick();
  };

  const trigger = (
    <ActionIcon
      variant="subtle"
      color={triggerColor}
      size={triggerSize}
      aria-label={label}
      style={triggerStyle}
      {...guard}
    >
      <KebabIcon size={iconSize} />
    </ActionIcon>
  );

  const confirmModal = confirming?.confirm && (
    <ResponsiveDialog
      opened
      onClose={() => setConfirming(null)}
      title={confirming.confirm.title}
    >
      <Stack gap="md">
        <Text c="var(--sw-ink-2)">{confirming.confirm.body}</Text>
        <Group justify="flex-end">
          <Button
            variant="subtle"
            c="var(--sw-ink-2)"
            onClick={() => setConfirming(null)}
          >
            {t("cancel")}
          </Button>
          <Button color="var(--sw-danger)" onClick={confirmNow}>
            {confirming.confirm.confirmLabel}
          </Button>
        </Group>
      </Stack>
    </ResponsiveDialog>
  );

  if (isMobile) {
    return (
      <>
        <ActionIcon
          variant="subtle"
          color={triggerColor}
          size={triggerSize}
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={sheetOpened}
          style={triggerStyle}
          onClick={() => setSheetOpened(true)}
          {...guard}
        >
          <KebabIcon size={iconSize} />
        </ActionIcon>
        <BottomSheet
          opened={sheetOpened}
          onClose={() => setSheetOpened(false)}
          title={label}
        >
          <Stack gap={2} pt={4}>
            {actions.map((action) => (
              <UnstyledButton
                key={action.key}
                disabled={action.disabled}
                onClick={() => run(action)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  minHeight: 48,
                  padding: "0 12px",
                  borderRadius: "var(--mantine-radius-md)",
                  color: action.danger ? "var(--sw-danger)" : "var(--sw-ink)",
                  opacity: action.disabled ? 0.4 : 1,
                  fontWeight: 600,
                  cursor: action.disabled ? "not-allowed" : "pointer",
                }}
              >
                <span>{action.label}</span>
                {action.rightSection}
              </UnstyledButton>
            ))}
          </Stack>
        </BottomSheet>
        {confirmModal}
      </>
    );
  }

  return (
    <>
      <Menu position="bottom-end" radius="md" withinPortal>
        <Menu.Target>{trigger}</Menu.Target>
        <Menu.Dropdown>
          {actions.map((action) => (
            <Menu.Item
              key={action.key}
              disabled={action.disabled}
              rightSection={action.rightSection}
              style={action.danger ? { color: "var(--sw-danger)" } : undefined}
              onClick={() => run(action)}
            >
              {action.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
      {confirmModal}
    </>
  );
};
