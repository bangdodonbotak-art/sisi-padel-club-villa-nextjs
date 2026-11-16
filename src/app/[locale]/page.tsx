/**
 * Final page — composes the 10 sections in order (build-contract §4):
 * Hero → ClubStrip → Manifesto → Courts → Vibe → Stay → Sessions →
 * FAQ → Booking → Visit, with MarqueeDivider bands between major
 * sections. The hero is split (SEO audit 2026-11-16): HeroShell renders
 * the headline/CTAs in SSR HTML, HeroInteractive (client-only, via
 * HeroLoader) takes over the canvas/GSAP/ball after hydration. Visit
 * flows directly into the footer marquee — no spacer, no dead band.
 */
import { getSite, isLocale, type Locale } from "@/lib/content";
import MarqueeDivider from "@/components/background/MarqueeDivider";
import HeroShell from "@/components/sections/HeroShell";
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
      <HeroShell hero={site.hero} preloader={site.preloader} />
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
