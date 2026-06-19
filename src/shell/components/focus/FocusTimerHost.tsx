import { useTranslation } from "react-i18next";
import { useFocusStore } from "../../../state/focusStore.ts";
import { useFocusTicker } from "../../hooks/useFocusTicker.ts";
import { ResponsiveDialog } from "../common/ResponsiveDialog.tsx";
import { FocusTimer } from "./FocusTimer.tsx";

export const FocusTimerHost = () => {
  const { t } = useTranslation("focus");
  useFocusTicker();
  const panelOpen = useFocusStore((state) => state.panelOpen);
  const closePanel = useFocusStore((state) => state.closePanel);

  return (
    <ResponsiveDialog opened={panelOpen} onClose={closePanel} title={t("title")}>
      <FocusTimer />
    </ResponsiveDialog>
  );
};
