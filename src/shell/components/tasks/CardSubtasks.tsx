import { UnstyledButton } from "@mantine/core";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../state/authStore.ts";
import { useSubtasksStore } from "../../../state/subtasksStore.ts";

interface CardSubtasksProps {
  taskId: string;
  onOpen?: () => void;
}

const MiniCheck = ({ done }: { done: boolean }) => (
  <svg
    width="9"
    height="9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--sw-accent-ink)"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path
      d="M5 12l4.5 4.5L19 7"
      pathLength={1}
      style={{
        strokeDasharray: 1,
        strokeDashoffset: done ? 0 : 1,
        transition: "stroke-dashoffset 200ms ease",
      }}
    />
  </svg>
);

export const CardSubtasks = ({ taskId, onOpen }: CardSubtasksProps) => {
  const { t } = useTranslation("tasks");
  const uid = useAuthStore((state) => state.uid);
  const items = useSubtasksStore((state) => state.itemsByTask[taskId]);

  useEffect(() => {
    if (!uid) return;
    useSubtasksStore.getState().retain(uid, taskId);
    return () => useSubtasksStore.getState().release(taskId);
  }, [uid, taskId]);

  if (!items || items.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        marginTop: 2,
        marginInlineStart: 28,
        paddingInlineStart: 8,
        borderInlineStart: "1.5px solid var(--sw-line)",
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            minWidth: 0,
            padding: "1px 0",
          }}
        >
          <UnstyledButton
            onClick={() => useSubtasksStore.getState().toggle(taskId, item.id)}
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            aria-pressed={item.done}
            aria-label={item.done ? t("subtasks.reopen") : t("subtasks.check")}
            style={{
              flex: "0 0 auto",
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: `2px solid ${item.done ? "var(--sw-done)" : "var(--sw-line)"}`,
              backgroundColor: item.done ? "var(--sw-done)" : "transparent",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 150ms ease, border-color 150ms ease",
            }}
          >
            <MiniCheck done={item.done} />
          </UnstyledButton>
          <UnstyledButton
            onClick={onOpen}
            onPointerDown={(event: { stopPropagation: () => void }) =>
              event.stopPropagation()
            }
            onKeyDown={(event: { stopPropagation: () => void }) =>
              event.stopPropagation()
            }
            component={onOpen ? "button" : "div"}
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: "start",
              fontSize: 13,
              lineHeight: 1.35,
              color: item.done ? "var(--sw-ink-3)" : "var(--sw-ink-2)",
              textDecoration: item.done ? "line-through" : "none",
              textDecorationColor: "var(--sw-ink-3)",
              wordBreak: "break-word",
              cursor: onOpen ? "pointer" : "default",
            }}
          >
            {item.title}
          </UnstyledButton>
        </div>
      ))}
    </div>
  );
};
