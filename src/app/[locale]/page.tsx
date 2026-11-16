/**
 * Final page — composes the sections in order (rebuild Stage 1):
 * Hero → ClubStrip → Manifesto → Courts → Sessions (continuation) →
 * Vibe → Stay → FAQ → Booking → Visit. No MarqueeDivider bands: the
 * only marquee left is the footer marquee. Courts + Sessions run back
 * to back as merged section "02 Courts & Sessions". The hero is split
 * (SEO audit 2026-11-16): HeroShell renders the headline/CTAs in SSR
 * HTML, HeroInteractive (client-only, via HeroLoader) takes over the
 * canvas/GSAP/ball after hydration. Visit flows directly into the
 * footer marquee — no spacer, no dead band.
 */
import { getSite, isLocale, type Locale } from "@/lib/content";
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
      <Manifesto manifesto={site.manifesto} />
      <Courts locale={loc} />
      <Sessions sessions={site.sessions} asContinuation />
      <Vibe locale={loc} />
      <Stay locale={loc} />
      <Faq locale={loc} />
      <Booking locale={loc} />
      <Visit locale={loc} />
    </>
  );
}
