import { Text } from "@mantine/core";
import { AnimatePresence, m } from "motion/react";
import { useCheerStore } from "../../../state/cheerStore.ts";

const CheerGlyph = ({ glyph, motion }: { glyph: string; motion: boolean }) => {
  if (!motion) {
    return (
      <span aria-hidden style={{ fontSize: 20, lineHeight: 1 }}>
        {glyph}
      </span>
    );
  }
  return (
    <m.span
      aria-hidden
      initial={{ y: 4, scale: 0.7, rotate: -8 }}
      animate={{ y: [-1, -9, -1], scale: [0.9, 1.1, 1], rotate: [-8, 6, 0] }}
      transition={{ duration: 1.1, ease: "easeInOut" }}
      style={{ fontSize: 20, lineHeight: 1, display: "inline-block" }}
    >
      {glyph}
    </m.span>
  );
};

export const CheerOverlay = () => {
  const cheers = useCheerStore((state) => state.cheers);

  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        insetInline: 0,
        bottom: "clamp(84px, 14vh, 168px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        pointerEvents: "none",
        zIndex: 250,
      }}
    >
      <AnimatePresence>
        {cheers.map((cheer) => (
          <m.div
            key={cheer.id}
            initial={
              cheer.motion ? { opacity: 0, y: 16, scale: 0.9 } : { opacity: 0 }
            }
            animate={
              cheer.motion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1 }
            }
            exit={
              cheer.motion ? { opacity: 0, y: -14, scale: 0.96 } : { opacity: 0 }
            }
            transition={{ duration: cheer.motion ? 0.32 : 0.2, ease: "easeOut" }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              paddingInline: 16,
              paddingBlock: 9,
              borderRadius: 999,
              backgroundColor: "var(--sw-card)",
              border: "1px solid var(--sw-line)",
              boxShadow: "var(--sw-shadow)",
              pointerEvents: "none",
            }}
          >
            <CheerGlyph glyph={cheer.glyph} motion={cheer.motion} />
            <Text ff="var(--sw-font-hand)" fz="lg" fw={600} c="var(--sw-ink)">
              {cheer.message}
            </Text>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
