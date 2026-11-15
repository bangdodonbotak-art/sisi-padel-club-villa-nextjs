"use client";

/**
 * Aurora — lime + turf-red blurred blobs drifting slowly over jungle.
 *
 * Motion-driven (not GSAP — one driver per surface; the hero keeps GSAP).
 * Only the 4 Sisi colours are used; 0 KB of new assets. Decorative,
 * pointer-events none, rendered in the fixed background stack behind content.
 * Static (no animation) under prefers-reduced-motion.
 */
import { motion, useReducedMotion } from "motion/react";

export default function Aurora() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute -top-32 left-[8%] h-[32rem] w-[32rem] rounded-full bg-lime/20 blur-3xl" />
        <div className="absolute top-[45%] right-[-6%] h-[28rem] w-[28rem] rounded-full bg-turf/25 blur-3xl" />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="absolute inset-0">
      <motion.div
        className="absolute -top-32 left-[8%] h-[32rem] w-[32rem] rounded-full bg-lime/20 blur-3xl"
        animate={{ x: [0, 90, 0], y: [0, 50, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[45%] right-[-6%] h-[28rem] w-[28rem] rounded-full bg-turf/25 blur-3xl"
        animate={{ x: [0, -70, 0], y: [0, -60, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[30%] h-[24rem] w-[24rem] rounded-full bg-lime/10 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
