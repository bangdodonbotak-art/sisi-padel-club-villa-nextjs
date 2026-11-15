"use client";

/**
 * CursorGlow — a lime glow that follows the cursor.
 *
 * Desktop only: rendered only when the device reports a fine pointer
 * (pointer: fine media query) and NOT under prefers-reduced-motion.
 * Motion springs smooth the follow; 0 KB new assets, pointer-events none.
 * It lives in the fixed background stack, behind content.
 */
import { useEffect, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";

export default function CursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const springX = useSpring(x, { stiffness: 120, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 120, damping: 18, mass: 0.4 });
  const transform = useMotionTemplate`translate3d(${springX}px, ${springY}px, 0) translate(-50%, -50%)`;

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!finePointer || reduced) return;
    setEnabled(true);

    const onMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="absolute top-0 left-0 h-72 w-72 rounded-full bg-lime/15 blur-3xl"
      style={{ transform }}
    />
  );
}
