import Image from "next/image";
import { getPhotos, getSite, type Locale } from "@/lib/content";
import DeferredVideo from "./DeferredVideo";
import Reveal from "./Reveal";

/** Real pixel dimensions of the stay photos (measured from the files). */
const DIMS: Record<string, { width: number; height: number }> = {
  "/assets/photos/sisi-hero.jpg": { width: 1280, height: 720 },
  "/assets/photos/sisi-airbnb-pool-facade.jpg": { width: 1280, height: 853 },
  "/assets/photos/sisi-airbnb-pool-garden.jpg": { width: 1280, height: 852 },
};

/**
 * Stay — villa reel + 3 photos, Airbnb and Tiket.com as SEPARATE labelled
 * cards, never merged (content-spec §2.6). Villa reel autoplay is
 * deferred until in view. Server component (video is the client
 * DeferredVideo island).
 */
export default function Stay({ locale }: { locale: Locale }) {
  const photos = getPhotos(locale);
  const site = getSite(locale);
  const { stay } = site;

  return (
    <section
      id="stay"
      className="relative overflow-hidden bg-sand px-6 py-24 text-jungle sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 border-b border-jungle/15 pb-10 md:flex-row md:items-end">
          <div>
            <span className="mb-3 block text-xs font-semibold tracking-[0.2em] text-turf uppercase">
              {stay.label}
            </span>
            <h2 className="font-display text-6xl font-bold sm:text-7xl md:text-8xl">
              {stay.heading}
            </h2>
          </div>
          <p className="max-w-md text-sm text-jungle/80 sm:text-base">
            {stay.intro}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <DeferredVideo
              src={photos.villaReel.src}
              ariaLabel={photos.villaReel.ariaLabel}
              className="aspect-[9/16] max-h-[640px] w-full rounded-3xl border border-jungle/15 object-cover"
            />
            <p className="mt-3 text-xs tracking-[0.18em] text-jungle/60 uppercase">
              {photos.villaReel.caption}
            </p>
          </Reveal>

          <div className="flex flex-col gap-6 lg:col-span-3">
            <div className="grid grid-cols-2 gap-4">
              {photos.stay.map((photo) => (
                <Image
                  key={photo.id}
                  src={photo.src}
                  alt={photo.alt}
                  width={DIMS[photo.src]?.width ?? 1280}
                  height={DIMS[photo.src]?.height ?? 720}
                  loading="lazy"
                  className={`aspect-[4/3] w-full rounded-2xl border border-jungle/15 object-cover ${photo.span === 2 ? "col-span-2" : ""}`}
                />
              ))}
            </div>

            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-2xl border border-jungle/15 bg-cream p-5">
                <p className="mb-1 text-[11px] tracking-[0.18em] text-jungle/60 uppercase">
                  {stay.airbnbLabel}
                </p>
                <p>{stay.airbnbBody}</p>
              </div>
              <div className="rounded-2xl border border-jungle/15 bg-cream p-5">
                <p className="mb-1 text-[11px] tracking-[0.18em] text-jungle/60 uppercase">
                  {stay.tiketLabel}
                </p>
                <p>{stay.tiketBody}</p>
              </div>
            </div>

            <a
              href={stay.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-jungle px-6 py-3.5 text-xs font-semibold tracking-[0.14em] text-sand uppercase transition-opacity hover:opacity-90"
            >
              {stay.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
