import { m, useAnimationControls } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { curlConfig } from "./curl.ts";

interface Cover {
  token: number;
  html: string;
  forward: boolean;
}

interface CurlTransitionHostProps {
  weekId: string;
  children: ReactNode;
}

const SHADOW = "18px 0 36px -8px var(--sw-fold-shade)";

export const CurlTransitionHost = ({
  weekId,
  children,
}: CurlTransitionHostProps) => {
  const liveRef = useRef<HTMLDivElement>(null);
  const liveControls = useAnimationControls();
  const prevWeek = useRef(weekId);
  const tokenRef = useRef(0);
  const [cover, setCover] = useState<Cover | null>(null);

  useLayoutEffect(() => {
    if (weekId === prevWeek.current) return;
    const forward = weekId > prevWeek.current;
    prevWeek.current = weekId;
    const node = liveRef.current;
    if (!node) return;
    tokenRef.current += 1;
    const token = tokenRef.current;
    setCover({ token, html: node.innerHTML, forward });

    if (forward) {
      liveControls.set({ x: "0%", rotate: 0, scale: 1 });
      return;
    }

    liveControls.set({
      x: "-112%",
      rotate: curlConfig.rotate,
      scale: curlConfig.scale,
    });
    void liveControls
      .start({
        x: "0%",
        rotate: 0,
        scale: 1,
        transition: { duration: curlConfig.duration, ease: curlConfig.ease },
      })
      .then(() => setCover((c) => (c?.token === token ? null : c)));
  }, [weekId, liveControls]);

  const backward = cover ? !cover.forward : false;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "var(--sw-paper)",
      }}
    >
      {backward && cover && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundColor: "var(--sw-paper)",
            zIndex: 0,
          }}
          dangerouslySetInnerHTML={{ __html: cover.html }}
        />
      )}
      <m.div
        ref={liveRef}
        initial={{ x: "0%", rotate: 0, scale: 1 }}
        animate={liveControls}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundColor: "var(--sw-paper)",
          zIndex: backward ? 1 : 0,
          boxShadow: backward ? SHADOW : undefined,
          willChange: backward ? "transform" : undefined,
        }}
      >
        {children}
      </m.div>
      {cover && cover.forward && (
        <m.div
          key={cover.token}
          aria-hidden
          initial={{ x: "0%", rotate: 0, scale: 1 }}
          animate={{
            x: "-112%",
            rotate: -curlConfig.rotate,
            scale: curlConfig.scale,
          }}
          transition={{ duration: curlConfig.duration, ease: curlConfig.ease }}
          onAnimationComplete={() =>
            setCover((c) => (c?.token === cover.token ? null : c))
          }
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundColor: "var(--sw-paper)",
            boxShadow: SHADOW,
            zIndex: 2,
            willChange: "transform",
          }}
          dangerouslySetInnerHTML={{ __html: cover.html }}
        />
      )}
    </div>
  );
};
