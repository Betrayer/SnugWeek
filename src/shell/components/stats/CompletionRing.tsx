import { RingProgress, Text } from "@mantine/core";

interface CompletionRingProps {
  completed: number;
  created: number;
  size?: number;
}

export const CompletionRing = ({
  completed,
  created,
  size = 86,
}: CompletionRingProps) => {
  const ratio = created > 0 ? Math.min(1, completed / created) : 0;
  return (
    <RingProgress
      size={size}
      thickness={11}
      roundCaps
      rootColor="color-mix(in srgb, var(--sw-done) 18%, transparent)"
      sections={[{ value: ratio * 100, color: "var(--sw-done)" }]}
      label={
        <Text
          ta="center"
          ff="var(--sw-font-hand)"
          fw={700}
          fz={26}
          lh={1}
          c="var(--sw-ink)"
        >
          {created > 0 ? `${Math.round(ratio * 100)}%` : "-"}
        </Text>
      }
    />
  );
};
