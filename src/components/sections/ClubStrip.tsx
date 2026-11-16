import type { SiteMessages } from "@/lib/content";

/**
 * ClubStrip — the three club stats (content-spec §2.2).
 * Typography only, no images. Server component.
 */
export default function ClubStrip({
  clubStrip,
}: {
  clubStrip: SiteMessages["clubStrip"];
}) {
  return (
    <section
      id="club-strip"
      className="relative border-b border-sand/15 px-6 py-8 text-sand sm:px-10 sm:py-10"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-4 text-center sm:gap-8">
        {clubStrip.stats.map((stat, i) => (
          <div
            key={stat.big}
            className={i === 1 ? "border-x border-sand/15 px-2" : undefined}
          >
            <div
              className={`font-display text-3xl font-bold sm:text-4xl ${i === 1 ? "" : "text-lime"}`}
            >
              {stat.big}
            </div>
            <div className="mt-0.5 text-[11px] tracking-wider text-sand/60 uppercase">
              {stat.small}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
