import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActionMenu } from "../common/ActionMenu.tsx";
import { PrintDialog } from "../print/PrintDialog.tsx";
import { ShareDialog } from "../share/ShareDialog.tsx";

export const WeekToolbarMenu = () => {
  const { t } = useTranslation(["share", "print"]);
  const [printOpened, setPrintOpened] = useState(false);
  const [shareOpened, setShareOpened] = useState(false);

  return (
    <>
      <ActionMenu
        label={t("share:menuLabel")}
        triggerColor="var(--sw-ink-2)"
        iconSize={20}
        actions={[
          {
            key: "share",
            label: t("share:menuAction"),
            onClick: () => setShareOpened(true),
          },
          {
            key: "print",
            label: t("print:menuAction"),
            onClick: () => setPrintOpened(true),
          },
        ]}
      />
      <ShareDialog opened={shareOpened} onClose={() => setShareOpened(false)} />
      <PrintDialog opened={printOpened} onClose={() => setPrintOpened(false)} />
    </>
  );
};
