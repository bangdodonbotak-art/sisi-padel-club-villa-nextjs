"use client";

/**
 * Vibe — 8-slide horizontal slider with prev/next + swipe (content-spec
 * §2.5). Slide 8 is the padel video, autoplay deferred until in view.
 * Prev/next scroll by 380px like the source; native swipe works via the
 * overflow-x track. Rebuild Stage 1: the kinetic marquee strip below the
 * slider was removed (footer marquee is the only marquee left).
 */
import { useRef } from "react";
import Image from "next/image";
import { getPhotos, getSite, type Locale } from "@/lib/content";
import DeferredVideo from "./DeferredVideo";

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

export default function Vibe({ locale }: { locale: Locale }) {
  const photos = getPhotos(locale);
  const site = getSite(locale);
  const { vibe } = site;
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    trackRef.current?.scrollBy({
      left: delta,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  // No marquee below the slider (removed in rebuild Stage 1).

  return (
    <section
      id="vibe"
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
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6 sm:px-10"
      >
        {photos.vibe.map((slide) => (
          <div
            key={slide.id}
            className="relative aspect-[4/5] w-[82vw] shrink-0 snap-start overflow-hidden rounded-3xl border border-sand/20 sm:w-[420px]"
          >
            {slide.kind === "video" ? (
              <DeferredVideo
                src={slide.src}
                ariaLabel={slide.alt}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <Image
                src={slide.src}
                alt={slide.alt}
                width={DIMS[slide.src]?.width ?? 1024}
                height={DIMS[slide.src]?.height ?? 1280}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
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
    </section>
  );
}
