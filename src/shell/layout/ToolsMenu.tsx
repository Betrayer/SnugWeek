import { spotlight } from "@mantine/spotlight";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS } from "../../i18n/languages.ts";
import { useAccountStore } from "../../state/accountStore.ts";
import { useAuthStore } from "../../state/authStore.ts";
import { useDecorStore } from "../../state/decorStore.ts";
import { useFocusStore } from "../../state/focusStore.ts";
import { useSettingsStore } from "../../state/settingsStore.ts";
import { ActionMenu } from "../components/common/ActionMenu.tsx";
import type { ActionItem } from "../components/common/ActionMenu.tsx";
import { CheckGlyph } from "../components/icons/glyphs.tsx";
import { PrintDialog } from "../components/print/PrintDialog.tsx";
import { ShareDialog } from "../components/share/ShareDialog.tsx";
import { useIsMobile } from "../hooks/useIsMobile.ts";

interface ToolsMenuProps {
  onWeek: boolean;
}

const Check = () => <CheckGlyph size={14} color="var(--sw-accent)" />;

export const ToolsMenu = ({ onWeek }: ToolsMenuProps) => {
  const { t } = useTranslation([
    "common",
    "decor",
    "focus",
    "share",
    "print",
    "auth",
  ]);
  const isMobile = useIsMobile();
  const editMode = useDecorStore((state) => state.editMode);
  const focusActive = useFocusStore(
    (state) => state.panelOpen || state.status === "running",
  );
  const language = useSettingsStore((state) => state.language);
  const isAnonymous = useAuthStore((state) => state.isAnonymous);
  const uid = useAuthStore((state) => state.uid);
  const [shareOpened, setShareOpened] = useState(false);
  const [printOpened, setPrintOpened] = useState(false);

  const accountAction: ActionItem | null =
    !isMobile || !uid
      ? null
      : isAnonymous
        ? {
          key: "signin",
          label: t("auth:logIn"),
          onClick: () => useAccountStore.getState().openAuthModal(),
          divider: true,
        }
        : {
          key: "signout",
          label: t("auth:signOut.action"),
          onClick: () => useAccountStore.getState().openSignOut(),
          divider: true,
        };

  const actions: ActionItem[] = [
    ...(isMobile
      ? [
        {
          key: "search",
          label: t("common:search"),
          onClick: () => spotlight.open(),
        },
      ]
      : []),
    ...(onWeek
      ? [
        {
          key: "decorate",
          label: t("decor:decorate"),
          onClick: () => useDecorStore.getState().toggleEdit(),
          rightSection: editMode ? <Check /> : undefined,
        },
      ]
      : []),
    {
      key: "focus",
      label: t("focus:open"),
      onClick: () => useFocusStore.getState().togglePanel(),
      rightSection: focusActive ? <Check /> : undefined,
    },
    ...(onWeek
      ? [
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
      ]
      : []),
    ...SUPPORTED_LANGS.map((lang, index) => ({
      key: `lang-${lang}`,
      label: t(`common:languageNames.${lang}`),
      onClick: () => useSettingsStore.getState().setLanguage(lang),
      rightSection: lang === language ? <Check /> : undefined,
      divider: index === 0,
    })),
    ...(accountAction ? [accountAction] : []),
  ];

  return (
    <>
      <ActionMenu
        label={t("common:tools")}
        triggerColor="var(--sw-ink-2)"
        iconSize={20}
        actions={actions}
      />
      {onWeek && (
        <>
          <ShareDialog
            opened={shareOpened}
            onClose={() => setShareOpened(false)}
          />
          <PrintDialog
            opened={printOpened}
            onClose={() => setPrintOpened(false)}
          />
        </>
      )}
    </>
  );
};
