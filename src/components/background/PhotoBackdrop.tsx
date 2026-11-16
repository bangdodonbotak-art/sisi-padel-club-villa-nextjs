"use client";

/**
 * PhotoBackdrop — premium dynamic background WITHOUT photos (Dony 15:25).
 *
 * Cancels the 12:21 photo-crossfade background: no <img> at all. A deep
 * jungle mesh gradient (lime + turf washes, Liquid Glass direction from
 * design-system/sisi-padel-club-villa-bali/MASTER.md) with one ultra-slow
 * breathing glow; the positional drift comes from the sibling <Aurora />
 * blobs and the texture from <Grain />. The hero is opaque and covers
 * this layer; from the first section after the hero down to the footer,
 * sections are transparent and this backdrop shows through — sand text
 * on dark jungle keeps readable contrast. Under prefers-reduced-motion
 * there is no animation at all (static mesh only).
 *
 * 0 KB of new assets, no new dependencies, Motion only.
 * Photos still exist in the galleries (Vibe, Stay, Courts) — only the
 * PAGE BACKGROUND below the hero changed.
 */
import { motion, useReducedMotion } from "motion/react";

const MESH_BACKGROUND = [
  "radial-gradient(60% 45% at 12% 6%, rgba(217, 255, 63, 0.13), transparent 70%)",
  "radial-gradient(55% 50% at 88% 36%, rgba(193, 39, 45, 0.12), transparent 70%)",
  "radial-gradient(70% 55% at 28% 96%, rgba(217, 255, 63, 0.08), transparent 70%)",
  "radial-gradient(40% 35% at 76% 88%, rgba(243, 239, 230, 0.04), transparent 70%)",
  "linear-gradient(180deg, #0e1f1a 0%, #14201b 45%, #0c1a15 100%)",
].join(", ");

export default function PhotoBackdrop() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* Mesh gradient base — static, deep jungle. */}
      <div
        className="absolute inset-0"
        style={{ background: MESH_BACKGROUND }}
      />
      {/* One slow breathing glow — the only motion owned by this layer. */}
      {!reduceMotion && (
        <motion.div
          className="absolute -top-[10%] left-[30%] h-[36rem] w-[36rem] rounded-full bg-lime/[0.07] blur-3xl"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {/* Readability scrim — gentle top/bottom darkening. */}
      <div className="absolute inset-0 bg-gradient-to-b from-jungle/60 via-transparent to-jungle/60" />
    </div>
  );
}
