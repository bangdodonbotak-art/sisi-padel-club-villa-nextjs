"use client";

/**
 * Stay — villa reel + 3 photos with lightbox, WhatsApp CTA.
 *
 * Villa cards deleted 16 Nov 2026 (Tugas B): the Airbnb and Tiket.com
 * cards are gone entirely — no OTA copy anywhere in this section.
 * What remains: heading + intro, the villa reel, the 3 stay photos
 * (click any photo to open the fullscreen Lightbox), and the
 * "ask about villa availability on WhatsApp" CTA.
 *
 * Motion premium (§04): staggered Reveal (reel → photos → CTA),
 * hover lift + shine sweep on each photo, slow Ken Burns on the
 * photos, subtle parallax on the photo grid. Everything is static
 * under prefers-reduced-motion (Reveal + useReducedMotion gates).
 * Photos are large tap targets (the whole photo is the button).
 * Readable on the dark gradient background (sand text, jungle cards).
 */
import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { getPhotos, getSite, type Locale } from "@/lib/content";
import DeferredVideo from "./DeferredVideo";
import Reveal from "./Reveal";
import Lightbox, { type LightboxItem } from "@/components/Lightbox";

/** Real pixel dimensions of the stay photos (measured from the files). */
const DIMS: Record<string, { width: number; height: number }> = {
  "/assets/photos/sisi-hero.jpg": { width: 1280, height: 720 },
  "/assets/photos/sisi-airbnb-pool-facade.jpg": { width: 1280, height: 853 },
  "/assets/photos/sisi-airbnb-pool-garden.jpg": { width: 1280, height: 852 },
};

export default function Stay({ locale }: { locale: Locale }) {
  const photos = getPhotos(locale);
  const site = getSite(locale);
  const { stay } = site;
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // Subtle parallax: photos drift up 24px across the section's scroll.
  const galleryY = useTransform(scrollYProgress, [0, 1], [0, -24]);

  const items: LightboxItem[] = photos.stay.map((photo) => ({
    type: "image",
    src: photo.src,
    alt: photo.alt,
  }));

  return (
    <section
      id="stay"
      ref={sectionRef}
      className="relative overflow-hidden px-6 py-24 text-sand sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 border-b border-sand/15 pb-10 md:flex-row md:items-end">
          <div>
            <span className="mb-3 block text-xs font-semibold tracking-[0.2em] text-lime uppercase">
              {stay.label}
            </span>
            <h2 className="font-display text-5xl font-bold sm:text-6xl md:text-7xl">
              {stay.heading}
            </h2>
          </div>
          <p className="max-w-md text-sm text-sand/80 sm:text-base">
            {stay.intro}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <DeferredVideo
              src={photos.villaReel.src}
              ariaLabel={photos.villaReel.ariaLabel}
              className="aspect-[9/16] max-h-[640px] w-full rounded-3xl border border-sand/20 object-cover"
            />
            <p className="mt-3 text-xs tracking-[0.18em] text-sand/60 uppercase">
              {photos.villaReel.caption}
            </p>
          </Reveal>

          <div className="flex flex-col gap-6 lg:col-span-3">
            <Reveal delay={0.12}>
              <motion.div
                style={reduceMotion ? undefined : { y: galleryY }}
                className="grid grid-cols-2 gap-4"
              >
                {photos.stay.map((photo, i) => (
                  <motion.button
                    key={photo.id}
                    type="button"
                    onClick={() => setOpenIndex(i)}
                    aria-label={photo.alt}
                    whileHover={reduceMotion ? undefined : { y: -6 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`group relative block w-full overflow-hidden rounded-2xl border border-sand/20 text-left shadow-lg shadow-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime ${photo.span === 2 ? "col-span-2" : ""}`}
                  >
                    <motion.div
                      animate={
                        reduceMotion ? undefined : { scale: [1, 1.06, 1] }
                      }
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="aspect-[4/3] w-full"
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        width={DIMS[photo.src]?.width ?? 1280}
                        height={DIMS[photo.src]?.height ?? 720}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </motion.div>
                    {/* Shine sweep on hover. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden"
                    />
                  </motion.button>
                ))}
              </motion.div>
            </Reveal>

            <Reveal delay={0.2}>
              <a
                href={stay.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-lime px-6 py-3.5 text-xs font-semibold tracking-[0.14em] text-jungle uppercase transition-opacity hover:opacity-90"
              >
                {stay.cta}
              </a>
            </Reveal>
          </div>
        </div>
      </div>

      {openIndex !== null && (
        <Lightbox
          items={items}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  );
}
