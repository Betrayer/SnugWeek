import { Box, Text } from "@mantine/core";
import { formatTime } from "../../../services/time.ts";
import type { WeekViewTask } from "../../../services/share/shareTypes.ts";
import { Pill } from "../common/Pill.tsx";
import { CheckGlyph } from "../icons/glyphs.tsx";

interface StaticTaskRowProps {
  task: WeekViewTask;
}

export const StaticTaskRow = ({ task }: StaticTaskRowProps) => (
  <Box style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "3px 0" }}>
    <span
      aria-hidden
      style={{
        marginTop: 2,
        flex: "0 0 auto",
        width: 18,
        height: 18,
        borderRadius: "50%",
        border: `2px solid ${task.done ? "var(--sw-done)" : "var(--sw-line)"}`,
        backgroundColor: task.done ? "var(--sw-done)" : "transparent",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {task.done && <CheckGlyph size={11} />}
    </span>
    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
      {task.time !== null && (
        <Pill tone={task.done ? "muted" : "accent-2"}>
          {formatTime(task.time)}
        </Pill>
      )}
      <Text
        component="span"
        style={{
          color: task.done ? "var(--sw-ink-3)" : "var(--sw-ink)",
          textDecorationLine: task.done ? "line-through" : "none",
          textDecorationColor: "var(--sw-ink-3)",
          lineHeight: 1.4,
          wordBreak: "break-word",
        }}
      >
        {task.title}
      </Text>
    </span>
  </Box>
);
