import { getSite, siteFacts, type Locale } from "@/lib/content";
import Reveal from "./Reveal";

/**
 * Visit — address/hours/rating card only (content-spec §2.10).
 *
 * Phone cards deleted 16 Nov 2026 (Dony 12:15 + 12:16): the Google
 * contact is gone entirely, and WhatsApp is only the single floating
 * button site-wide. Bottom padding is kept tight so Visit flows
 * directly into the footer marquee with no dead band.
 * Server component.
 */
export default function Visit({ locale }: { locale: Locale }) {
  const site = getSite(locale);
  const { visit, common } = site;

  return (
    <section
      id="visit"
      className="relative border-t border-sand/15 px-6 pt-24 pb-16 text-sand sm:px-10 sm:pt-32 sm:pb-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 border-b border-sand/15 pb-10 md:flex-row md:items-end">
          <div>
            <span className="mb-3 block text-xs font-semibold tracking-[0.2em] text-lime uppercase">
              {visit.label}
            </span>
            <h2 className="font-display text-5xl font-bold sm:text-6xl md:text-7xl">
              {visit.heading}
            </h2>
          </div>
          <div className="rounded-full border border-sand/15 bg-[#162F28] px-4 py-2.5 font-mono text-xs text-lime sm:text-sm">
            {visit.coordsPill}
          </div>
        </div>

        <div className="mt-12">
          <Reveal>
            <div className="flex h-full flex-col justify-between space-y-6 rounded-3xl border border-sand/15 bg-[#162F28] p-7 sm:p-8">
              <div>
                <span className="text-xs font-semibold tracking-[0.18em] text-lime uppercase">
                  {visit.addressLabel}
                </span>
                <h3 className="font-display mt-2 text-4xl font-bold">
                  {visit.addressTitle}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-sand/85">
                  {common.addressLines[0]}
                  <br />
                  {common.addressLines[1]}
                </p>
                <p className="mt-2 font-mono text-xs text-sand/65">
                  {visit.coordsLine}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-sand/15 pt-6">
                <div>
                  <span className="block text-[11px] tracking-wider text-sand/60 uppercase">
                    {visit.hoursLabel}
                  </span>
                  <span className="font-display text-2xl font-bold text-lime">
                    {visit.hoursValue}
                  </span>
                  <span className="block text-xs text-sand/70">
                    {visit.hoursSub}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] tracking-wider text-sand/60 uppercase">
                    {visit.ratingLabel}
                  </span>
                  <span className="font-display text-2xl font-bold text-sand">
                    {visit.ratingValue}
                  </span>
                  <span className="block text-xs text-sand/70">
                    {visit.ratingSub}
                  </span>
                </div>
              </div>

              <a
                href={siteFacts.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-sand px-5 py-3.5 text-xs font-semibold tracking-[0.15em] text-jungle uppercase transition-colors hover:bg-lime"
              >
                {visit.mapsButton}
              </a>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
