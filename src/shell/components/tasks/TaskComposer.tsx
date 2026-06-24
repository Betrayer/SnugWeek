import { useTranslation } from "react-i18next";
import { TOUR_ANCHORS } from "../../../data/tourSteps.ts";
import { AddControl } from "../common/AddControl.tsx";

interface TaskComposerProps {
  onAdd: (title: string) => void;
  placeholder?: string;
  dataDay?: number;
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
}

const MAX_TITLE = 500;
const COUNTER_FROM = 400;

export const TaskComposer = ({
  onAdd,
  placeholder,
  dataDay,
  active,
  onActiveChange,
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
      dataTour={dataDay !== undefined ? TOUR_ANCHORS.addTask : undefined}
      active={active}
      onActiveChange={onActiveChange}
      chained
    />
  );
};
