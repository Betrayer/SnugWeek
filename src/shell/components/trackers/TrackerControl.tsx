import { Group, Popover, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import type { Tracker } from "../../../services/repos/trackersRepo.ts";
import type { TrackerValue } from "../../../services/repos/weeksRepo.ts";
import { MOOD_EMOJIS } from "../../../services/stats/moodScale.ts";
import { useWeekStore } from "../../../state/weekStore.ts";
import { TrackerIcon } from "./TrackerIcon.tsx";
import { trackerDisplayName } from "./trackerName.ts";

interface TrackerControlProps {
  tracker: Tracker;
  day: number;
  value: TrackerValue | undefined;
}

const NUMBER_MAX = 999;

const CheckGlyph = () => (
  <svg
    width="12"
    height="12"
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

interface ControlProps {
  tracker: Tracker;
  day: number;
  value: TrackerValue | undefined;
  name: string;
}

const EmojiControl = ({ tracker, day, value, name }: ControlProps) => {
  const { t } = useTranslation("trackers");
  const [opened, handlers] = useDisclosure(false);
  const current = typeof value === "string" ? value : null;
  const pick = (emoji: string) => {
    if (current === emoji) useWeekStore.getState().clearTrackerValue(day, tracker.id);
    else useWeekStore.getState().setTrackerValue(day, tracker.id, emoji);
    handlers.close();
  };
  return (
    <Popover opened={opened} onChange={handlers.toggle} position="bottom" withArrow>
      <Popover.Target>
        <UnstyledButton
          onClick={handlers.toggle}
          aria-label={
            current
              ? t("valueOf", { name, value: current })
              : t("set", { name })
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            fontSize: 18,
            lineHeight: 1,
            opacity: current ? 1 : 0.4,
            color: "var(--sw-ink-3)",
          }}
        >
          {current ?? <TrackerIcon icon={tracker.icon} size={18} />}
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown p={6} style={{ backgroundColor: "var(--sw-card)" }}>
        <Group gap={4} wrap="nowrap">
          {MOOD_EMOJIS.map((emoji) => (
            <UnstyledButton
              key={emoji}
              onClick={() => pick(emoji)}
              aria-label={emoji}
              style={{
                width: 30,
                height: 30,
                fontSize: 20,
                lineHeight: 1,
                borderRadius: "var(--mantine-radius-sm)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  current === emoji ? "var(--sw-highlight)" : "transparent",
              }}
            >
              {emoji}
            </UnstyledButton>
          ))}
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
};

const Scale5Control = ({ tracker, day, value, name }: ControlProps) => {
  const { t } = useTranslation("trackers");
  const current = typeof value === "number" ? value : 0;
  const tap = (level: number) => {
    if (current === level) useWeekStore.getState().clearTrackerValue(day, tracker.id);
    else useWeekStore.getState().setTrackerValue(day, tracker.id, level);
  };
  return (
    <Group gap={4} wrap="nowrap" style={{ opacity: current > 0 ? 1 : 0.55 }}>
      <TrackerIcon icon={tracker.icon} size={15} color="var(--sw-ink-3)" />
      <Group gap={3} wrap="nowrap">
        {[1, 2, 3, 4, 5].map((level) => (
          <UnstyledButton
            key={level}
            onClick={() => tap(level)}
            aria-label={t("scaleStep", { name, value: level })}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: `1.5px solid ${level <= current ? "var(--sw-accent)" : "var(--sw-line)"}`,
              backgroundColor:
                level <= current ? "var(--sw-accent)" : "transparent",
            }}
          />
        ))}
      </Group>
    </Group>
  );
};

const NumberControl = ({ tracker, day, value, name }: ControlProps) => {
  const { t } = useTranslation("trackers");
  const [opened, handlers] = useDisclosure(false);
  const isSet = typeof value === "number";
  const current = isSet ? value : 0;
  const setValue = (next: number) =>
    useWeekStore
      .getState()
      .setTrackerValue(day, tracker.id, Math.min(Math.max(next, 0), NUMBER_MAX));
  const stepStyle = {
    width: 28,
    height: 28,
    borderRadius: "var(--mantine-radius-sm)",
    border: "1px solid var(--sw-line)",
    color: "var(--sw-ink-2)",
    fontSize: 18,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  } as const;
  return (
    <Popover opened={opened} onChange={handlers.toggle} position="bottom" withArrow>
      <Popover.Target>
        <UnstyledButton
          onClick={handlers.toggle}
          aria-label={
            isSet ? t("valueOf", { name, value: current }) : t("set", { name })
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            opacity: isSet ? 1 : 0.45,
            color: "var(--sw-ink-2)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <TrackerIcon icon={tracker.icon} size={15} color="var(--sw-ink-3)" />
          {isSet ? current : "–"}
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown p={8} style={{ backgroundColor: "var(--sw-card)" }}>
        <Group gap={8} wrap="nowrap" align="center">
          <UnstyledButton
            onClick={() => setValue(current - 1)}
            aria-label={t("decrease", { name })}
            style={stepStyle}
          >
            −
          </UnstyledButton>
          <span
            style={{
              minWidth: 32,
              textAlign: "center",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--sw-ink)",
            }}
          >
            {isSet ? current : 0}
          </span>
          <UnstyledButton
            onClick={() => setValue(current + 1)}
            aria-label={t("increase", { name })}
            style={stepStyle}
          >
            +
          </UnstyledButton>
          <UnstyledButton
            onClick={() => {
              useWeekStore.getState().clearTrackerValue(day, tracker.id);
              handlers.close();
            }}
            aria-label={t("clear")}
            style={{
              ...stepStyle,
              width: "auto",
              paddingInline: 8,
              fontSize: 13,
              color: "var(--sw-ink-3)",
            }}
          >
            {t("clear")}
          </UnstyledButton>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
};

const CheckboxControl = ({ tracker, day, value, name }: ControlProps) => {
  const { t } = useTranslation("trackers");
  const checked = value === true;
  const toggle = () => {
    if (checked) useWeekStore.getState().clearTrackerValue(day, tracker.id);
    else useWeekStore.getState().setTrackerValue(day, tracker.id, true);
  };
  return (
    <UnstyledButton
      onClick={toggle}
      aria-label={
        checked ? t("valueOf", { name, value: "✓" }) : t("set", { name })
      }
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        borderRadius: "50%",
        border: `1.5px solid ${checked ? "var(--sw-accent)" : "var(--sw-line)"}`,
        backgroundColor: checked ? "var(--sw-accent)" : "transparent",
        opacity: checked ? 1 : 0.55,
        color: "var(--sw-ink-3)",
      }}
    >
      {checked ? <CheckGlyph /> : <TrackerIcon icon={tracker.icon} size={13} />}
    </UnstyledButton>
  );
};

export const TrackerControl = ({ tracker, day, value }: TrackerControlProps) => {
  const { t } = useTranslation("trackers");
  const name = trackerDisplayName(tracker, t);
  const props: ControlProps = { tracker, day, value, name };
  switch (tracker.type) {
    case "emoji":
      return <EmojiControl {...props} />;
    case "scale5":
      return <Scale5Control {...props} />;
    case "number":
      return <NumberControl {...props} />;
    case "checkbox":
      return <CheckboxControl {...props} />;
  }
};
