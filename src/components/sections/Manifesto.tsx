"use client";

/**
 * Manifesto — word-by-word scroll reveal (content-spec §2.3).
 *
 * The source drove this with GSAP scrub 0.6; the rebuild uses Motion
 * (one driver per surface — GSAP is hero-only). Each word's opacity is a
 * Motion useTransform of the section scroll progress, so the scrub feel
 * is preserved without GSAP. Copy is verbatim from the content layer.
 *
 * Motion (Task C): the 3 fact cards get a staggered whileInView reveal,
 * a gentle section-level parallax drift, and a hover lift + shine sweep.
 * All of it is static under prefers-reduced-motion.
 */
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { SiteMessages } from "@/lib/content";
import ParallaxLayers from "@/components/background/ParallaxLayers";

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

type Fact = SiteMessages["manifesto"]["facts"][number];

function FactCard({
  fact,
  index,
  reduceMotion,
}: {
  fact: Fact;
  index: number;
  reduceMotion: boolean;
}) {
  const inner = (
    <>
      {/* Shine sweep: a diagonal light band that glides across on hover. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-[160%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[160%]"
      />
      <span className="relative text-[11px] font-semibold tracking-[0.2em] text-lime uppercase">
        {fact.label}
      </span>
      <p className="font-display relative mt-1 text-2xl font-bold">
        {fact.title}
      </p>
      <p className="relative mt-1 text-xs text-sand/75">{fact.body}</p>
    </>
  );

  if (reduceMotion) {
    return (
      <div className="rounded-2xl border border-sand/20 bg-jungle/55 p-5 backdrop-blur-sm">
        {inner}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.14, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-sand/20 bg-jungle/55 p-5 backdrop-blur-sm will-change-transform"
    >
      {inner}
    </motion.div>
  );
}

export default function Manifesto({
  manifesto,
}: {
  manifesto: SiteMessages["manifesto"];
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ["start 0.76", "end 0.58"],
  });
  // Gentle parallax drift on the fact grid only — slow and small so the
  // word scrub above it stays the dominant motion on this section.
  const { scrollYProgress: sectionProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const factsY = useTransform(sectionProgress, [0, 1], [26, -26]);
  const words = manifesto.text.trim().split(/\s+/);

  return (
    <section
      id="manifesto"
      ref={sectionRef}
      className="relative overflow-hidden px-6 py-24 text-sand sm:px-10 sm:py-32 md:py-40"
    >
      <ParallaxLayers />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-sand/15 pb-8 text-xs tracking-[0.2em] text-sand/70 uppercase">
          <span>{manifesto.label}</span>
          <span>{manifesto.labelRight}</span>
        </div>

        {/* Manifesto copy + type, Dony 17 Nov 2026 02:44 WIB: location prefix
            removed from the text (starts at "Sisi Padel..."), size cut 25%
            (was 7vw/5.5vw/4.2vw), no more all-caps. */}
        <p
          ref={textRef}
          className="font-display text-[5.25vw] leading-[0.96] font-bold tracking-tight text-sand sm:text-[4.1vw] md:text-[3.15vw]"
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

        <motion.div
          style={reduceMotion ? undefined : { y: factsY }}
          className="mt-14 grid grid-cols-1 gap-4 border-t border-sand/15 pt-8 sm:grid-cols-3"
        >
          {manifesto.facts.map((fact, i) => (
            <FactCard
              key={fact.title}
              fact={fact}
              index={i}
              reduceMotion={reduceMotion ?? false}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
