import { Modal } from "@mantine/core";
import type { ReactNode } from "react";
import { useIsMobile } from "../../hooks/useIsMobile.ts";
import { BottomSheet } from "./BottomSheet.tsx";

interface ResponsiveDialogProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
}

export const ResponsiveDialog = ({
  opened,
  onClose,
  title,
  children,
  closeOnClickOutside = true,
  closeOnEscape = true,
}: ResponsiveDialogProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <BottomSheet opened={opened} onClose={onClose} title={title}>
        {children}
      </BottomSheet>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      zIndex={300}
      closeOnClickOutside={closeOnClickOutside}
      closeOnEscape={closeOnEscape}
      styles={{
        content: { backgroundColor: "var(--sw-paper)" },
        header: { backgroundColor: "var(--sw-paper)" },
      }}
    >
      {children}
    </Modal>
  );
};
