/**
 * HeroShell — SERVER component: the SEO-critical hero markup.
 *
 * Split from the old monolithic client-only Hero (dynamic ssr:false),
 * which left the homepage with NO <h1> in server-rendered HTML — the
 * #1 SEO defect found in the 2026-11-16 audit. This shell renders in SSR
 * HTML: preloader, first-frame <img>, canvas element, meta bar, eyebrow,
 * H1, CTAs, subcopy. The interactive layer (canvas frame sequence, GSAP
 * pin/scrub, floating ball) lives in HeroInteractive, loaded client-only
 * via HeroLoader, and takes over these DOM nodes by id after mount.
 *
 * No behaviour changed: frame sequence, pin/scrub values, preloader,
 * headline and ball timeline are verbatim from the old Hero.
 *
 * <noscript> hides the preloader when JS is off, so the SSR content is
 * never trapped behind the overlay for no-JS crawlers/users.
 */
import type { SiteMessages } from "@/lib/content";
import HeroLoader from "@/components/sections/HeroLoader";

export default function HeroShell({
  hero,
  preloader,
}: {
  hero: SiteMessages["hero"];
  preloader: SiteMessages["preloader"];
}) {
  return (
    <>
      <noscript
        dangerouslySetInnerHTML={{
          __html: "<style>#preloader{display:none!important}</style>",
        }}
      />
      {/* Preloader: counter 00 to 100 with glowing lime ball, then fade */}
      <div
        id="preloader"
        className="fixed inset-0 z-[100] flex flex-col justify-between bg-jungle p-6 text-sand select-none md:p-12"
      >
        <div className="flex items-center justify-between text-xs tracking-[0.2em] uppercase opacity-80">
          <span>{preloader.topLeft}</span>
          <span>{preloader.topRight}</span>
        </div>

        <div className="relative my-auto flex flex-col items-center justify-center">
          <div className="relative mb-8 flex items-center justify-center">
            <div
              id="preloader-glow"
              className="h-24 w-24 rounded-full bg-lime opacity-40 blur-2xl md:h-32 md:w-32"
            />
            <div
              id="preloader-ball"
              className="absolute flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-jungle bg-lime shadow-[0_0_40px_#D9FF3F] md:h-16 md:w-16"
            >
              <div className="h-12 w-12 -translate-x-4 rounded-full border-[3px] border-jungle/35" />
              <div className="h-12 w-12 translate-x-4 rounded-full border-[3px] border-jungle/35" />
            </div>
          </div>

          <div className="font-display flex items-baseline text-[22vw] leading-none font-bold tracking-tight text-lime md:text-[11vw]">
            <span id="preloader-count">00</span>
            <span className="ml-1 text-2xl text-sand/70 md:text-4xl">%</span>
          </div>
          <p className="mt-3 text-xs tracking-[0.25em] text-sand/60 uppercase">
            {preloader.underCounter}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] tracking-[0.18em] text-sand/50 uppercase">
          <span>{preloader.bottomLeft}</span>
          <span>{preloader.bottomRight}</span>
        </div>
      </div>

      {/* Hero section */}
      <section
        id="hero"
        className="relative flex min-h-[105svh] w-full flex-col justify-between overflow-hidden bg-jungle pt-24 pb-8 text-sand md:pb-12"
      >
        {/* Frame 1: real <img> for instant LCP; the canvas draws the sequence on top */}
        <img
          id="hero-first-frame"
          src="/hero/desktop/0001.webp"
          fetchPriority="high"
          alt={hero.firstFrameAlt}
          width={1280}
          height={720}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
        />
        <canvas
          id="hero-canvas"
          className="absolute inset-0 h-full w-full"
          data-frame="0"
        />
        {/* Bottom scrim for headline legibility over the bright scene */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-jungle/85 via-jungle/35 to-transparent" />

        {/* Top meta bar — the ONE allowed change: a subtle scrim/pill behind
            the whole metadata line so it stays legible over the frames. */}
        <div className="relative z-20 mx-auto w-full max-w-7xl px-6 pt-2 sm:px-10">
          <div className="flex w-fit max-w-full flex-wrap items-center justify-between gap-2 rounded-full border border-sand/15 bg-jungle/45 px-3 py-1.5 text-[11px] tracking-[0.18em] text-sand/85 uppercase backdrop-blur-sm sm:text-xs">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-sand/20 bg-jungle/40 px-2.5 py-1 font-medium text-lime">
                {hero.metaLeft}
              </span>
              <span className="hidden text-sand/70 sm:inline">
                {hero.metaLeftDesktop}
              </span>
            </div>
            <div className="font-mono text-sand/75">{hero.metaRight}</div>
          </div>
        </div>

        {/* Headline + CTAs (bottom-left, over the scene) */}
        <div className="relative z-20 mx-auto mt-auto w-full max-w-7xl px-6 sm:px-10">
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-lime uppercase">
            {hero.eyebrow}
          </p>
          <h1 className="font-display leading-[0.84] font-bold tracking-tight select-none">
            <span className="block text-[19vw] text-sand sm:text-[15vw] lg:text-[11vw]">
              {hero.headlineLine1}
            </span>
            <span className="block text-[20vw] text-lime italic sm:text-[16vw] lg:text-[12vw]">
              {hero.headlineLine2}
            </span>
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              href={hero.primaryCtaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-lime px-6 py-3.5 text-xs font-semibold tracking-[0.14em] text-jungle uppercase transition-opacity hover:opacity-95 sm:text-sm"
            >
              {hero.primaryCta}
            </a>
            <a
              href={hero.secondaryCtaUrl}
              className="text-xs tracking-[0.14em] text-sand/90 uppercase underline decoration-lime/70 underline-offset-4 transition-colors hover:text-lime sm:text-sm"
            >
              {hero.secondaryCta}
            </a>
            <p className="max-w-md text-sm leading-snug text-sand/85 sm:text-base">
              {hero.subcopy}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive layer (canvas sequence, GSAP, ball) mounts after hydration */}
      <HeroLoader ballAlt={hero.ballAlt} />
    </>
  );
}
