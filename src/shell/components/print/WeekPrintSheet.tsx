import { createPortal } from "react-dom";
import type { WeekViewModel } from "../../../services/share/shareTypes.ts";
import { WeekView } from "../weekview/WeekView.tsx";

interface WeekPrintSheetProps {
  model: WeekViewModel;
}

export const WeekPrintSheet = ({ model }: WeekPrintSheetProps) =>
  createPortal(
    <div className="sw-print-root">
      <WeekView model={model} variant="print" />
    </div>,
    document.body,
  );
