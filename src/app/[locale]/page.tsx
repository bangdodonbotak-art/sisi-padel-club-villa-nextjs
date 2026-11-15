/**
 * Final page — composes the 10 sections in order (build-contract §4):
 * Hero → ClubStrip → Manifesto → Courts → Vibe → Stay → Sessions →
 * FAQ → Booking → Visit, with MarqueeDivider bands between major
 * sections. Hero is client-only (dynamic ssr:false) so SSR never renders
 * a different frame index than the client. Visit flows directly into
 * the footer marquee — no spacer, no dead band.
 */
import { getSite, isLocale, type Locale } from "@/lib/content";
import MarqueeDivider from "@/components/background/MarqueeDivider";
import HeroLoader from "@/components/sections/HeroLoader";
import ClubStrip from "@/components/sections/ClubStrip";
import Manifesto from "@/components/sections/Manifesto";
import Courts from "@/components/sections/Courts";
import Vibe from "@/components/sections/Vibe";
import Stay from "@/components/sections/Stay";
import Sessions from "@/components/sections/Sessions";
import Faq from "@/components/sections/Faq";
import Booking from "@/components/sections/Booking";
import Visit from "@/components/sections/Visit";

export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : "id";
  const site = getSite(loc);

  return (
    <>
      <HeroLoader hero={site.hero} preloader={site.preloader} />
      <ClubStrip clubStrip={site.clubStrip} />
      <MarqueeDivider />
      <Manifesto manifesto={site.manifesto} />
      <Courts locale={loc} />
      <MarqueeDivider />
      <Vibe locale={loc} />
      <Stay locale={loc} />
      <MarqueeDivider />
      <Sessions sessions={site.sessions} />
      <Faq locale={loc} />
      <MarqueeDivider />
      <Booking locale={loc} />
      <Visit locale={loc} />
    </>
  );
}
