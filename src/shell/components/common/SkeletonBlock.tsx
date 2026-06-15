import { Box, Stack } from "@mantine/core";
import { useReducedMotionPref } from "../../hooks/useReducedMotionPref.ts";

interface SkeletonBlockProps {
  height?: number | string;
  width?: number | string;
  radius?: number | string;
  count?: number;
}

export const SkeletonBlock = ({
  height = 16,
  width = "100%",
  radius = "var(--mantine-radius-sm)",
  count = 1,
}: SkeletonBlockProps) => {
  const reduced = useReducedMotionPref();
  return (
    <Stack gap={8} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <Box
          key={index}
          style={{
            height,
            width,
            borderRadius: radius,
            backgroundColor: "var(--sw-paper-2)",
            animation: reduced ? undefined : "sw-pulse 1.5s ease-in-out infinite",
          }}
        />
      ))}
    </Stack>
  );
};
