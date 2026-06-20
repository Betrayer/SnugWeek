import { Box, Text, Textarea, Transition } from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TOUR_ANCHORS } from "../../../data/tourSteps.ts";
import { useWeekStore } from "../../../state/weekStore.ts";

interface DayNoteProps {
  day: number;
}

export const DayNote = ({ day }: DayNoteProps) => {
  const { t } = useTranslation("week");
  const note = useWeekStore((state) => state.week?.dayNotes[String(day)] ?? "");
  const weekId = useWeekStore((state) => state.weekId);
  const saveState = useWeekStore(
    (state) => state.dayNoteSaveState[day] ?? "idle",
  );
  const setDayNote = useWeekStore((state) => state.setDayNote);
  const [value, setValue] = useState(note);
  const [syncedNote, setSyncedNote] = useState(note);
  const [syncedKey, setSyncedKey] = useState(`${weekId}:${day}`);

  const key = `${weekId}:${day}`;
  if (note !== syncedNote || key !== syncedKey) {
    setSyncedNote(note);
    setSyncedKey(key);
    setValue(note);
  }

  return (
    <Box
      data-tour={TOUR_ANCHORS.weekNote}
      style={{
        position: "relative",
        borderTop: "1px dashed var(--sw-line)",
        paddingBlockStart: 4,
        transform: "rotate(-0.3deg)",
      }}
    >
      <Textarea
        variant="unstyled"
        autosize
        minRows={1}
        maxRows={3}
        aria-label={t("notePlaceholder")}
        placeholder={t("notePlaceholder")}
        value={value}
        onChange={(event) => {
          setValue(event.currentTarget.value);
          setDayNote(day, event.currentTarget.value);
        }}
        styles={{
          input: {
            fontFamily: "var(--sw-font-hand)",
            fontSize: "1.15rem",
            lineHeight: 1.35,
            color: "var(--sw-ink-2)",
            backgroundColor: "transparent",
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0, transparent calc(1.35em - 1px), color-mix(in srgb, var(--sw-line) 60%, transparent) calc(1.35em - 1px), color-mix(in srgb, var(--sw-line) 60%, transparent) 1.35em)",
            backgroundAttachment: "local",
            backgroundPositionY: "0.28em",
            padding: 0,
            minHeight: "unset",
            "--input-placeholder-color": "var(--sw-ink-3)",
          },
        }}
      />
      <Transition mounted={saveState === "saved"} transition="fade" duration={250}>
        {(style) => (
          <Text
            fz={11}
            style={{
              ...style,
              position: "absolute",
              top: 4,
              insetInlineEnd: 0,
              color: "var(--sw-done)",
              fontWeight: 700,
            }}
          >
            ✓
          </Text>
        )}
      </Transition>
    </Box>
  );
};
