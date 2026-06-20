import { Box, Button, Group, SimpleGrid } from "@mantine/core";
import { m } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useReducedMotionPref } from "../../hooks/useReducedMotionPref.ts";

interface PinPadProps {
  length: number;
  onComplete: (pin: string) => void;
  busy?: boolean;
  shakeSignal: number;
  ariaLabel: string;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const keyStyles = {
  root: {
    backgroundColor: "var(--sw-card)",
    borderColor: "var(--sw-line)",
    color: "var(--sw-ink)",
    fontSize: 22,
    fontWeight: 500,
  },
};

export const PinPad = ({
  length,
  onComplete,
  busy = false,
  shakeSignal,
  ariaLabel,
}: PinPadProps) => {
  const reduced = useReducedMotionPref();
  const [value, setValue] = useState("");

  const press = useCallback(
    (digit: string) => {
      if (busy) return;
      setValue((prev) => (prev.length >= length ? prev : prev + digit));
    },
    [busy, length],
  );

  const backspace = useCallback(() => {
    setValue((prev) => prev.slice(0, -1));
  }, []);

  useEffect(() => {
    if (value.length === length) onComplete(value);
  }, [value, length, onComplete]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key >= "0" && event.key <= "9") {
        event.preventDefault();
        press(event.key);
      } else if (event.key === "Backspace") {
        event.preventDefault();
        backspace();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, backspace]);

  return (
    <Group gap="lg" align="center" style={{ flexDirection: "column" }}>
      <m.div
        animate={
          reduced || shakeSignal === 0 ? undefined : { x: [0, -8, 8, -6, 6, 0] }
        }
        transition={{ duration: 0.4 }}
      >
        <Group gap="sm" role="status" aria-label={ariaLabel}>
          {Array.from({ length }, (_, index) => (
            <Box
              key={index}
              w={14}
              h={14}
              style={{
                borderRadius: "50%",
                border: "2px solid",
                backgroundColor:
                  index < value.length ? "var(--sw-accent)" : "transparent",
                borderColor:
                  index < value.length ? "var(--sw-accent)" : "var(--sw-ink-3)",
                transition: "background-color 120ms, border-color 120ms",
              }}
            />
          ))}
        </Group>
      </m.div>
      <SimpleGrid cols={3} spacing="sm" w={232}>
        {KEYS.map((digit) => (
          <Button
            key={digit}
            variant="default"
            radius="xl"
            size="lg"
            h={56}
            disabled={busy}
            onClick={() => press(digit)}
            styles={keyStyles}
          >
            {digit}
          </Button>
        ))}
        <Box />
        <Button
          variant="default"
          radius="xl"
          size="lg"
          h={56}
          disabled={busy}
          onClick={() => press("0")}
          styles={keyStyles}
        >
          0
        </Button>
        <Button
          variant="subtle"
          radius="xl"
          size="lg"
          h={56}
          disabled={busy || value.length === 0}
          onClick={backspace}
          aria-label="Backspace"
          styles={{ root: { color: "var(--sw-ink-2)" } }}
        >
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 5H8.5L3 12l5.5 7H21z" />
            <path d="M16 9.5 12 14M12 9.5 16 14" />
          </svg>
        </Button>
      </SimpleGrid>
    </Group>
  );
};
