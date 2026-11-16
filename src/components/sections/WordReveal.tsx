"use client";

/**
 * WordReveal — headline words rise into place, one by one, as the
 * heading scrolls into view (Dony 17 Nov 2026, Tidepool reference:
 * headlines + cards enter staggered on scroll; checklist items fill
 * in sequence).
 *
 * Each word sits in an overflow-hidden mask; the inner span slides up
 * from 110% with a small per-word stagger. Transform + opacity only,
 * slow and calm to match the site mood. The words stay in the DOM in
 * reading order, so SSR HTML and SEO are untouched — only the motion
 * is client-side. Fully static under prefers-reduced-motion.
 *
 * Trigger note (verified 17 Nov 2026): the in-view check observes the
 * WRAPPER span, not the word itself. A word at y:110% sits exactly
 * below its mask, so an IntersectionObserver on the word reports zero
 * intersection (clipped by the mask) and `whileInView` on the word
 * never fires — Vibe/Stay/FAQ headings stayed invisible. Observing
 * the un-translated wrapper fixes it for every heading.
 */
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

export default function WordReveal({
  text,
  className = "",
  delay = 0,
  stagger = 0.055,
}: {
  text: string;
  className?: string;
  /** Extra delay before the first word (seconds). */
  delay?: number;
  /** Gap between words (seconds). */
  stagger?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const words = text.trim().split(/\s+/);

  if (reduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom"
        >
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "110%" }}
            animate={inView ? { y: "0%" } : { y: "110%" }}
            transition={{
              duration: 0.55,
              delay: delay + i * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
