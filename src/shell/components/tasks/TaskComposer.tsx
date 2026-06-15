import { useTranslation } from "react-i18next";
import { AddControl } from "../common/AddControl.tsx";

interface TaskComposerProps {
  onAdd: (title: string) => void;
  placeholder?: string;
  dataDay?: number;
}

const MAX_TITLE = 500;
const COUNTER_FROM = 400;

export const TaskComposer = ({
  onAdd,
  placeholder,
  dataDay,
}: TaskComposerProps) => {
  const { t } = useTranslation("tasks");
  return (
    <AddControl
      label={t("add")}
      placeholder={placeholder ?? t("composerPlaceholder")}
      onAdd={onAdd}
      maxLength={MAX_TITLE}
      counterFrom={COUNTER_FROM}
      dataDay={dataDay}
      chained
    />
  );
};
