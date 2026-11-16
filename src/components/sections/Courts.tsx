"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { getCourts, getSite, siteFacts, type Locale } from "@/lib/content";
import ParallaxLayers from "@/components/background/ParallaxLayers";
import FacilityIcon from "@/components/sections/FacilityIcon";
import Lightbox, { type LightboxItem } from "@/components/Lightbox";
import Reveal from "./Reveal";
import WordReveal from "./WordReveal";

/**
 * Courts — Upper + Main court cards with real photos and the 7 verified
 * facilities (content-spec §2.4). Card links go to WhatsApp (§6 #5–8).
 * Photos: next/image with real dimensions (1024×1280) + spec alts.
 * Task A: court photos open in the Lightbox; gentle scroll parallax +
 * slow Ken Burns on photos, staggered facility reveal, hover lift +
 * shine sweep on cards. All motion off under prefers-reduced-motion.
 * Cards keep the dark jungle/sand palette so they stay readable over
 * the dark gradient page background.
 */

/** Slow Ken Burns zoom (18s loop) on a photo; static when reduced. */
function KenBurns({
  children,
  reduceMotion,
}: {
  children: ReactNode;
  reduceMotion: boolean;
}) {
  if (reduceMotion) return <>{children}</>;
  return (
    <motion.div
      className="absolute inset-0"
      animate={{ scale: [1.08, 1.14, 1.08] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

/** Facility tile with staggered whileInView reveal + hover lift. */
function FacilityItem({
  children,
  index,
  reduceMotion,
  className,
}: {
  children: ReactNode;
  index: number;
  reduceMotion: boolean;
  className: string;
}) {
  if (reduceMotion) {
    return <li className={className}>{children}</li>;
  }
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.li>
  );
}

export default function Courts({ locale }: { locale: Locale }) {
  const courts = getCourts(locale);
  const site = getSite(locale);
  const { courts: strings } = site;
  const reduceMotion = useReducedMotion() ?? false;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Gentle scroll parallax on the court photos (±18px across the section).
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], [18, -18]);

  const items: LightboxItem[] = courts.map((court) => ({
    type: "image",
    src: court.photo,
    alt: court.photoAlt,
  }));

  return (
    <section
      id="courts"
      ref={sectionRef}
      className="court-grid-lines relative overflow-hidden px-6 py-24 text-sand sm:px-10 sm:py-32"
    >
      <ParallaxLayers />
      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 border-b border-sand/20 pb-10 md:flex-row md:items-end">
          <div>
            <span className="mb-3 block text-xs font-semibold tracking-[0.2em] text-lime uppercase">
              {strings.label}
            </span>
            <h2 className="font-display text-5xl font-bold sm:text-6xl md:text-7xl">
              <WordReveal text={strings.heading} />
            </h2>
          </div>
          <p className="max-w-md text-sm text-sand/85 sm:text-base">
            {strings.intro}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {courts.map((court, i) => (
            <Reveal key={court.id} delay={i * 0.12}>
              <motion.article
                whileHover={reduceMotion ? undefined : { y: -6 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-sand/20 bg-jungle/45 p-6 backdrop-blur-sm transition-shadow hover:shadow-2xl hover:shadow-black/30 sm:p-8"
              >
                {/* Shine sweep on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-gradient-to-r from-transparent via-sand/10 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[120%]"
                />
                <div className="relative">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <span className="rounded-full border border-sand/30 bg-turf px-3 py-1 font-mono text-xs tracking-[0.2em] uppercase">
                      {court.badge}
                    </span>
                    <span className="text-xs font-semibold tracking-[0.18em] text-lime uppercase">
                      {court.tag}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    aria-label={court.photoAlt}
                    className="relative mb-6 block w-full cursor-pointer overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-lime"
                  >
                    <motion.div
                      style={reduceMotion ? undefined : { y: photoY }}
                      className="relative aspect-[16/10] w-full"
                    >
                      <KenBurns reduceMotion={reduceMotion}>
                        <Image
                          src={court.photo}
                          alt={court.photoAlt}
                          width={1024}
                          height={1280}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-105"
                        />
                      </KenBurns>
                    </motion.div>
                  </button>

                  <h3 className="font-display text-4xl font-bold text-sand sm:text-5xl">
                    {court.title}
                  </h3>
                  <p className="mt-2 text-sm text-sand/80">{court.body}</p>
                </div>

                <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-sand/15 pt-5 text-xs tracking-[0.16em] uppercase">
                  <span className="text-sand/80">{court.footerLabel}</span>
                  <a
                    href={siteFacts.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-lime hover:underline"
                  >
                    {court.footerLinkLabel}
                  </a>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 border-t border-sand/20 pt-12">
          <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <h3 className="font-display text-3xl font-bold sm:text-4xl">
              <WordReveal text={strings.facilitiesHeading} delay={0.1} />
            </h3>
            <span className="text-xs tracking-[0.2em] text-sand/75 uppercase">
              {strings.facilitiesHeadingRight}
            </span>
          </div>

          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-7">
            {strings.facilities.map((facility, i) => (
              <FacilityItem
                key={facility}
                index={i}
                reduceMotion={reduceMotion}
                className={`flex min-h-[132px] flex-col items-center justify-center gap-3 rounded-2xl border border-sand/20 bg-jungle/55 p-4 text-center ${i === 6 ? "col-span-2 sm:col-span-1" : ""}`}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lime text-jungle">
                  <FacilityIcon index={i} />
                </span>
                <span className="font-display text-lg leading-tight font-bold tracking-wide">
                  {facility}
                </span>
              </FacilityItem>
            ))}
          </ol>
        </Reveal>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          items={items}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}
