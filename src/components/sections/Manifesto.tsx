"use client";

/**
 * Manifesto — word-by-word scroll reveal (content-spec §2.3).
 *
 * The source drove this with GSAP scrub 0.6; the rebuild uses Motion
 * (one driver per surface — GSAP is hero-only). Each word's opacity is a
 * Motion useTransform of the section scroll progress, so the scrub feel
 * is preserved without GSAP. Copy is verbatim from the content layer.
 */
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { SiteMessages } from "@/lib/content";
import ParallaxLayers from "@/components/background/ParallaxLayers";
import Reveal from "./Reveal";

function Word({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span
      style={{ opacity }}
      className="mr-[0.22em] inline-block will-change-transform"
    >
      {word}
    </motion.span>
  );
}

export default function Manifesto({
  manifesto,
}: {
  manifesto: SiteMessages["manifesto"];
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ["start 0.76", "end 0.58"],
  });
  const words = manifesto.text.trim().split(/\s+/);

  return (
    <section
      id="manifesto"
      className="relative overflow-hidden bg-sand px-6 py-24 text-jungle sm:px-10 sm:py-32 md:py-40"
    >
      <ParallaxLayers />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-jungle/15 pb-8 text-xs tracking-[0.2em] text-jungle/70 uppercase">
          <span>{manifesto.label}</span>
          <span>{manifesto.labelRight}</span>
        </div>

        <p
          ref={textRef}
          className="font-display text-[7vw] leading-[0.96] font-bold tracking-tight text-jungle uppercase sm:text-[5.5vw] md:text-[4.2vw]"
        >
          {words.map((word, i) => (
            <Word
              key={`${word}-${i}`}
              word={word}
              progress={scrollYProgress}
              range={[i / words.length, (i + 1) / words.length]}
            />
          ))}
        </p>

        <Reveal className="mt-14 grid grid-cols-1 gap-4 border-t border-jungle/15 pt-8 sm:grid-cols-3">
          {manifesto.facts.map((fact) => (
            <div
              key={fact.title}
              className="rounded-2xl border border-jungle/10 bg-[#E5DEC9]/70 p-5"
            >
              <span className="text-[11px] font-semibold tracking-[0.2em] text-turf uppercase">
                {fact.label}
              </span>
              <p className="font-display mt-1 text-2xl font-bold">
                {fact.title}
              </p>
              <p className="mt-1 text-xs text-jungle/75">{fact.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
