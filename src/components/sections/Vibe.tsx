"use client";

/**
 * Vibe — 8-slide horizontal slider with prev/next + swipe (content-spec
 * §2.5). Slide 8 is the padel video, autoplay deferred until in view.
 * Prev/next scroll by 380px like the source; native swipe works via the
 * overflow-x track. Rebuild Stage 1: the kinetic marquee strip below the
 * slider was removed (footer marquee is the only marquee left).
 * Task A: every slide opens in the Lightbox (photos + video with
 * controls); slow auto-advance of the gallery + gentle Ken Burns zoom
 * on slide media. All motion off under prefers-reduced-motion.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { getPhotos, getSite, type Locale } from "@/lib/content";
import DeferredVideo from "./DeferredVideo";
import Lightbox, { type LightboxItem } from "@/components/Lightbox";

/** Real pixel dimensions of the vibe photos (measured from the files). */
const DIMS: Record<string, { width: number; height: number }> = {
  "/assets/photos/padel-hero-A1.jpg": { width: 1024, height: 1280 },
  "/assets/photos/padel-A5.jpg": { width: 1024, height: 1280 },
  "/assets/photos/sisi-villa-portrait.jpg": { width: 720, height: 1280 },
  "/assets/photos/padel-C1-grup.jpg": { width: 960, height: 1280 },
  "/assets/photos/padel-B1.jpg": { width: 960, height: 1280 },
  "/assets/photos/padel-C2-netpost.jpg": { width: 960, height: 1280 },
  "/assets/photos/entrance.jpg": { width: 1080, height: 1080 },
};

/** Slow Ken Burns zoom (22s loop) on slide media; static when reduced. */
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
      animate={{ scale: [1, 1.07, 1] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function Vibe({ locale }: { locale: Locale }) {
  const photos = getPhotos(locale);
  const site = getSite(locale);
  const { vibe } = site;
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);

  const items: LightboxItem[] = photos.vibe.map((slide) => ({
    type: slide.kind,
    src: slide.src,
    alt: slide.alt,
  }));

  const scrollBy = (delta: number) => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    trackRef.current?.scrollBy({
      left: delta,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  // Track whether the gallery is on screen (autoplay only while visible).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Slow auto-advance (6s per slide, loops back to start). Paused while
  // hovering, while the lightbox is open, off-screen, or reduced motion.
  useEffect(() => {
    if (reduceMotion || !inView || hovered || lightboxIndex !== null) return;
    const id = window.setInterval(() => {
      const track = trackRef.current;
      if (!track || document.hidden) return;
      const atEnd =
        track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      if (atEnd) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: 380, behavior: "smooth" });
      }
    }, 6000);
    return () => window.clearInterval(id);
  }, [reduceMotion, inView, hovered, lightboxIndex]);

  // No marquee below the slider (removed in rebuild Stage 1).

  return (
    <section
      id="vibe"
      ref={sectionRef}
      className="relative overflow-hidden py-24 text-sand sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="mb-3 block text-xs font-semibold tracking-[0.2em] text-lime uppercase">
              {vibe.label}
            </span>
            <h2 className="font-display text-5xl font-bold sm:text-6xl md:text-7xl">
              {vibe.heading}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-display text-2xl tracking-wider text-lime uppercase">
              {vibe.swipe}
            </span>
            <button
              type="button"
              aria-label={vibe.prevAria}
              onClick={() => scrollBy(-380)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-sand/25 transition-colors hover:border-lime hover:text-lime"
            >
              ←
            </button>
            <button
              type="button"
              aria-label={vibe.nextAria}
              onClick={() => scrollBy(380)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-sand/25 transition-colors hover:border-lime hover:text-lime"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        data-lenis-prevent
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6 sm:px-10"
      >
        {photos.vibe.map((slide, i) => (
          <div
            key={slide.id}
            role="button"
            tabIndex={0}
            aria-label={slide.alt}
            onClick={() => setLightboxIndex(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setLightboxIndex(i);
              }
            }}
            className="group relative aspect-[4/5] w-[82vw] shrink-0 cursor-pointer snap-start overflow-hidden rounded-3xl border border-sand/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime sm:w-[420px]"
          >
            <KenBurns reduceMotion={reduceMotion}>
              {slide.kind === "video" ? (
                <DeferredVideo
                  src={slide.src}
                  ariaLabel={slide.alt}
                  paused={lightboxIndex !== null}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  width={DIMS[slide.src]?.width ?? 1024}
                  height={DIMS[slide.src]?.height ?? 1280}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
            </KenBurns>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-jungle/80 via-transparent to-jungle/30" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-xs tracking-[0.18em] uppercase">
              <span>{slide.label}</span>
              <span
                className={`rounded-full px-2.5 py-1 ${slide.kind === "video" ? "bg-turf text-sand" : "bg-jungle/60 text-lime"}`}
              >
                {slide.badge}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 border-t border-sand/20 p-5 text-xs text-sand/85">
              {slide.caption}
            </div>
          </div>
        ))}
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
