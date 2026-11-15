"use client";

/**
 * ScrollCrossfade — section background crossfade:
 * sand → turf red → jungle → sand → jungle.
 *
 * Implemented as an opacity crossfade between five fixed colour layers
 * driven by Motion's page scroll progress — NEVER a per-frame
 * background-color animation. Only the 4 Sisi colours; 0 KB new assets.
 * Under prefers-reduced-motion the background stays sand.
 */
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

const LAYERS = [
  { color: "bg-sand", center: 0 },
  { color: "bg-turf", center: 0.25 },
  { color: "bg-jungle", center: 0.5 },
  { color: "bg-sand", center: 0.75 },
  { color: "bg-jungle", center: 1 },
] as const;

function CrossfadeLayer({
  color,
  center,
  progress,
}: {
  color: string;
  center: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  // Triangle opacity: 0 at neighbouring centres, 1 at this centre.
  // First/last layers clamp to full opacity at the page edges.
  const input =
    center === 0
      ? [0, 0.15]
      : center === 1
        ? [0.85, 1]
        : [center - 0.15, center, center + 0.15];
  const output =
    center === 0 ? [1, 0] : center === 1 ? [0, 1] : [0, 1, 0];
  const opacity = useTransform(progress, input, output);
  return <motion.div aria-hidden="true" className={`absolute inset-0 ${color}`} style={{ opacity }} />;
}

export default function ScrollCrossfade() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  if (reduceMotion) {
    return <div aria-hidden="true" className="absolute inset-0 bg-sand" />;
  }

  return (
    <div aria-hidden="true" className="absolute inset-0">
      {LAYERS.map((layer) => (
        <CrossfadeLayer
          key={`${layer.color}-${layer.center}`}
          color={layer.color}
          center={layer.center}
          progress={scrollYProgress}
        />
      ))}
    </div>
  );
}
