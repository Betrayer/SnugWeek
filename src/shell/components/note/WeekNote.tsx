import { Box, Text, Textarea, Transition } from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWeekStore } from "../../../state/weekStore.ts";

export const WeekNote = () => {
  const { t } = useTranslation("week");
  const note = useWeekStore((state) => state.week?.note ?? "");
  const weekId = useWeekStore((state) => state.weekId);
  const noteSaveState = useWeekStore((state) => state.noteSaveState);
  const setNote = useWeekStore((state) => state.setNote);
  const [value, setValue] = useState(note);
  const [syncedNote, setSyncedNote] = useState(note);
  const [syncedWeekId, setSyncedWeekId] = useState(weekId);

  if (note !== syncedNote || weekId !== syncedWeekId) {
    setSyncedNote(note);
    setSyncedWeekId(weekId);
    setValue(note);
  }

  return (
    <Box style={{ position: "relative", maxWidth: 640 }}>
      <Textarea
        variant="unstyled"
        autosize
        minRows={2}
        maxRows={4}
        placeholder={t("notePlaceholder")}
        value={value}
        onChange={(event) => {
          setValue(event.currentTarget.value);
          setNote(event.currentTarget.value);
        }}
        styles={{
          input: {
            fontFamily: "var(--sw-font-hand)",
            fontSize: "1.5rem",
            lineHeight: 1.5,
            color: "var(--sw-ink)",
            backgroundColor: "transparent",
            "--input-placeholder-color": "var(--sw-ink-3)",
          },
        }}
      />
      <Transition
        mounted={noteSaveState === "saved"}
        transition="fade"
        duration={250}
      >
        {(style) => (
          <Text
            fz="sm"
            style={{
              ...style,
              position: "absolute",
              top: 0,
              insetInlineEnd: 0,
              color: "var(--sw-done)",
              fontWeight: 600,
            }}
          >
            ✓ {t("noteSaved")}
          </Text>
        )}
      </Transition>
    </Box>
  );
};
