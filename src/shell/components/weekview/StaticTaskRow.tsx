import { Box, Text } from "@mantine/core";
import { formatTime } from "../../../services/time.ts";
import type { WeekViewTask } from "../../../services/share/shareTypes.ts";

interface StaticTaskRowProps {
  task: WeekViewTask;
}

const CheckMark = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--sw-accent-ink)"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M5 12l4.5 4.5L19 7" />
  </svg>
);

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
      {task.done && <CheckMark />}
    </span>
    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
      {task.time !== null && (
        <span
          style={{
            alignSelf: "flex-start",
            fontSize: 10,
            fontWeight: 700,
            lineHeight: 1.5,
            color: task.done ? "var(--sw-ink-3)" : "var(--sw-accent-2)",
            backgroundColor: task.done
              ? "color-mix(in srgb, var(--sw-ink-3) 10%, transparent)"
              : "color-mix(in srgb, var(--sw-accent-2) 14%, transparent)",
            padding: "0 6px",
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          {formatTime(task.time)}
        </span>
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
