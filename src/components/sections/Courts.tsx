import Image from "next/image";
import { getCourts, getSite, siteFacts, type Locale } from "@/lib/content";
import ParallaxLayers from "@/components/background/ParallaxLayers";
import Reveal from "./Reveal";

/**
 * Courts — Upper + Main court cards with real photos and the 7 verified
 * facilities (content-spec §2.4). Card links go to WhatsApp (§6 #5–8).
 * Photos: next/image with real dimensions (1024×1280) + spec alts.
 * Server component.
 */
export default function Courts({ locale }: { locale: Locale }) {
  const courts = getCourts(locale);
  const site = getSite(locale);
  const { courts: strings } = site;

  return (
    <section
      id="courts"
      className="court-grid-lines relative overflow-hidden bg-turf px-6 py-24 text-sand sm:px-10 sm:py-32"
    >
      <ParallaxLayers />
      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 border-b border-sand/20 pb-10 md:flex-row md:items-end">
          <div>
            <span className="mb-3 block text-xs font-semibold tracking-[0.2em] text-lime uppercase">
              {strings.label}
            </span>
            <h2 className="font-display text-6xl font-bold sm:text-7xl md:text-8xl">
              {strings.heading}
            </h2>
          </div>
          <p className="max-w-md text-sm text-sand/85 sm:text-base">
            {strings.intro}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {courts.map((court) => (
            <Reveal key={court.id}>
              <article className="flex flex-col justify-between rounded-3xl border border-sand/20 bg-jungle/45 p-6 backdrop-blur-sm sm:p-8">
                <div>
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <span className="rounded-full border border-sand/30 bg-turf px-3 py-1 font-mono text-xs tracking-[0.2em] uppercase">
                      {court.badge}
                    </span>
                    <span className="text-xs font-semibold tracking-[0.18em] text-lime uppercase">
                      {court.tag}
                    </span>
                  </div>

                  <Image
                    src={court.photo}
                    alt={court.photoAlt}
                    width={1024}
                    height={1280}
                    loading="lazy"
                    className="relative mb-6 aspect-[16/10] w-full rounded-2xl object-cover object-[center_30%]"
                  />

                  <h3 className="font-display text-4xl font-bold text-sand sm:text-5xl">
                    {court.title}
                  </h3>
                  <p className="mt-2 text-sm text-sand/80">{court.body}</p>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-sand/15 pt-5 text-xs tracking-[0.16em] uppercase">
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
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 border-t border-sand/20 pt-12">
          <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <h3 className="font-display text-3xl font-bold sm:text-4xl">
              {strings.facilitiesHeading}
            </h3>
            <span className="text-xs tracking-[0.2em] text-sand/75 uppercase">
              {strings.facilitiesHeadingRight}
            </span>
          </div>

          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-7">
            {strings.facilities.map((facility, i) => (
              <li
                key={facility}
                className={`flex min-h-[108px] flex-col justify-between rounded-2xl border border-sand/20 bg-jungle/55 p-4 ${i === 6 ? "col-span-2 sm:col-span-1" : ""}`}
              >
                <span className="font-mono text-[11px] text-lime">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-xl font-bold tracking-wide">
                  {facility}
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
