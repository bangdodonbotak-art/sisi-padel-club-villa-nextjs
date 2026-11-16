/**
 * HeroShell — SERVER component: the SEO-critical hero markup.
 *
 * Split from the old monolithic client-only Hero (dynamic ssr:false),
 * which left the homepage with NO <h1> in server-rendered HTML — the
 * #1 SEO defect found in the 2026-11-16 audit. This shell renders in SSR
 * HTML: preloader, first-frame <img>, canvas element, eyebrow,
 * H1. The interactive layer (canvas frame sequence, GSAP
 * pin/scrub, floating ball) lives in HeroInteractive, loaded client-only
 * via HeroLoader, and takes over these DOM nodes by id after mount.
 *
 * Stage 1 rebuild (16 Nov 2026): top meta bar removed, secondary CTA +
 * subcopy removed — hero is eyebrow + H1 only. The Chat WhatsApp CTA
 * was removed 16 Nov 2026 (Dony 12:16) — the single floating WhatsApp
 * button replaces it site-wide.
 *
 * Frame sequence, pin/scrub values, preloader, and ball timeline are
 * verbatim from the old Hero; Stage 1 changed only headline sizes,
 * ball size/start, first-frame responsive source, and hero padding.
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
          {/* preloader.topRight dihapus — perintah Dony 10:50, jangan dikembalikan */}
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
        className="relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden bg-jungle pt-24 pb-32 text-sand md:pb-24"
      >
        {/* Frame 1: real <img> for instant LCP; the canvas draws the sequence on top.
            Mobile gets the lighter /hero/mobile/0001.webp via <picture>; the
            desktop frame stays the fallback <img>. Mobile object-position 57%
            matches the canvas frame-0 focus shift in HeroInteractive (Dony
            17 Nov 2026: model starts centred on portrait phones), so there
            is no jump when the canvas takes over; desktop keeps object-center. */}
        <picture>
          <source
            media="(max-width: 768px)"
            srcSet="/hero/mobile/0001.webp"
          />
          <img
            id="hero-first-frame"
            src="/hero/desktop/0001.webp"
            fetchPriority="high"
            alt={hero.firstFrameAlt}
            width={1280}
            height={720}
            className="absolute inset-0 h-full w-full object-cover object-[57%_50%] transition-opacity duration-500 md:object-center"
          />
        </picture>
        <canvas
          id="hero-canvas"
          className="absolute inset-0 h-full w-full"
          data-frame="0"
        />
        {/* Sun glare: soft radial glow, top-right corner, above the canvas
            but below the z-20 content. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 z-10 h-[55%] w-[65%] opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 78% 12%, rgba(255, 244, 180, 0.55) 0%, rgba(255, 236, 160, 0.18) 38%, transparent 68%)",
          }}
        />
        {/* Bottom scrim for headline legibility over the bright scene */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-jungle/85 via-jungle/35 to-transparent" />

        {/* Headline (bottom-left, over the scene) — no CTA here any more:
            the floating WhatsApp button is the only chat button (Dony 12:16). */}
        <div className="relative z-20 mx-auto mt-auto w-full max-w-7xl px-6 sm:px-10">
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-lime uppercase">
            {hero.eyebrow}
          </p>
          <h1 className="font-display leading-[0.84] font-bold tracking-tight select-none">
            {/* Headline size cut ~20% on Dony's order 17 Nov 2026 02:34 WIB
                ("tulisan STAY. PLAY. Breathe. terlalu gede") — was
                15vw/16vw mobile, 12vw/13vw sm, 9vw/10vw lg. */}
            <span className="block text-[12vw] text-sand sm:text-[10vw] lg:text-[7.5vw]">
              {hero.headlineLine1}
            </span>
            <span className="block text-[13vw] text-lime italic sm:text-[11vw] lg:text-[8vw]">
              {hero.headlineLine2}
            </span>
          </h1>
        </div>
      </section>

      {/* Interactive layer (canvas sequence, GSAP, ball) mounts after hydration */}
      <HeroLoader ballAlt={hero.ballAlt} />
    </>
  );
}
