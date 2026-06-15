import { useTranslation } from "react-i18next";
import { useListsStore } from "../../../state/listsStore.ts";
import { AddControl } from "../common/AddControl.tsx";

const MAX_NAME = 120;

export const AddListControl = () => {
  const { t } = useTranslation("tasks");
  return (
    <AddControl
      label={t("lists.add")}
      placeholder={t("lists.namePlaceholder")}
      onAdd={(name) => useListsStore.getState().addList(name)}
      maxLength={MAX_NAME}
    />
  );
};
