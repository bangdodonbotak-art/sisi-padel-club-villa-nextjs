"use client";

/**
 * Hero — 1:1 PORT of the live hero (content-spec §0 / §3.1, architecture §3).
 * DO NOT CHANGE the frame sequence, pin/scrub values, preloader, headline,
 * or ball behaviour. The ONLY allowed change is the scrim/pill behind the
 * hero metadata line (see the meta bar below) for legibility.
 *
 * - Canvas frame sequence: 64 desktop / 48 mobile WebP frames, breakpoint
 *   swap at 768px (matchMedia, picked once at load, as in the source).
 * - Frame 0 loads first, then batches of 8 with 6 concurrent loaders;
 *   scroll scrub picks frame round(progress × (count − 1)); nearest loaded
 *   frame at-or-below is drawn as fallback, never backwards.
 * - GSAP ScrollTrigger pin: start 'top top', end '+=400%', scrub 0.5.
 * - Preloader: counter 00–100 from decoded frames, hides at ≥8 decoded,
 *   3s safety timeout, fades 0.55s then display:none + ScrollTrigger.refresh().
 * - Ball: /padel-ball.png (657,492 B, never converted/resized/recoloured),
 *   fixed layer, start top 16vh / right 6vw (mobile) and 18vh / 14vw
 *   (desktop); scrub 0.8 timeline rotation 340° → 720° → 1080°,
 *   scale 0.72 → 0.48 → 0.34, final opacity 0.85; procedural SVG fallback
 *   if the PNG fails to load.
 * - Client-only (page loads it with dynamic ssr:false); gsap.context() +
 *   ctx.revert() cleanup in useLayoutEffect.
 * - Primary CTA changed per content-spec §6 #3–4 only: "Chat WhatsApp" →
 *   https://wa.me/628111592462. Secondary CTA unchanged.
 */
import { useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SiteMessages } from "@/lib/content";

export default function Hero({
  hero,
  preloader,
}: {
  hero: SiteMessages["hero"];
  preloader: SiteMessages["preloader"];
}) {
  const [ballFailed, setBallFailed] = useState(false);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // --- Preloader (identical to source) ---
      const preloaderEl = document.getElementById("preloader");
      const countEl = document.getElementById("preloader-count");
      const preloaderBall = document.getElementById("preloader-ball");
      let preloaderHidden = false;
      function hidePreloader() {
        if (preloaderHidden || !preloaderEl) return;
        preloaderHidden = true;
        gsap.to(preloaderEl, {
          opacity: 0,
          duration: 0.55,
          ease: "power2.out",
          onComplete: () => {
            preloaderEl.style.display = "none";
            ScrollTrigger.refresh();
          },
        });
      }
      if (preloaderBall) {
        gsap.to(preloaderBall, {
          rotation: 360,
          scale: 1.12,
          duration: 1.25,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }
      // Safety: never block the page longer than 3s even if frames stall.
      setTimeout(hidePreloader, 3000);

      // Reduced motion: fully static — hide preloader, first-frame <img>
      // stays visible, no scrub, no pin, no ball timeline (as in source).
      if (prefersReducedMotion) {
        if (preloaderEl) preloaderEl.style.display = "none";
        return;
      }

      // --- Hero frame sequence (Vibora pattern, verbatim) ---
      const heroCanvas = document.getElementById(
        "hero-canvas",
      ) as HTMLCanvasElement | null;
      const heroFirstImg = document.getElementById(
        "hero-first-frame",
      ) as HTMLImageElement | null;
      const heroIsMobile = window.matchMedia("(max-width: 768px)").matches;
      const heroSet = heroIsMobile
        ? { base: "/hero/mobile/", count: 48 }
        : { base: "/hero/desktop/", count: 64 };
      const heroImgs: (HTMLImageElement | null)[] = new Array(
        heroSet.count,
      ).fill(null);
      let heroDecoded = 0;
      let heroShown = -1;

      function heroURL(i: number) {
        return heroSet.base + String(i + 1).padStart(4, "0") + ".webp";
      }
      // First-frame <img> must match the active set (desktop by default in markup).
      if (heroFirstImg) heroFirstImg.src = heroURL(0);

      function heroProgress() {
        if (countEl)
          countEl.textContent = String(
            Math.round((heroDecoded / heroSet.count) * 100),
          ).padStart(2, "0");
        if (heroDecoded >= 8) hidePreloader();
      }

      function heroSizeCanvas() {
        if (!heroCanvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = heroCanvas.clientWidth;
        const h = heroCanvas.clientHeight;
        if (!w || !h) return;
        heroCanvas.width = Math.round(w * dpr);
        heroCanvas.height = Math.round(h * dpr);
      }

      function heroDraw(i: number) {
        if (!heroCanvas) return;
        // Nearest loaded frame at or below i (Vibora fallback); never go backwards.
        let j = i;
        while (j > 0 && !heroImgs[j]) j--;
        const img = heroImgs[j];
        if (!img) return;
        heroSizeCanvas();
        const ctx2d = heroCanvas.getContext("2d");
        if (!ctx2d) return;
        const cw = heroCanvas.width;
        const ch = heroCanvas.height;
        const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx2d.clearRect(0, 0, cw, ch);
        ctx2d.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
        heroCanvas.dataset.frame = String(i);
        heroShown = i;
        if (heroFirstImg && j === 0) heroFirstImg.style.opacity = "0";
      }

      function heroLoadOne(i: number) {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            img
              .decode()
              .then(() => {
                heroImgs[i] = img;
                heroDecoded++;
                heroProgress();
                if (i === 0) heroDraw(0);
                resolve();
              })
              .catch(() => {
                heroImgs[i] = img;
                heroDecoded++;
                heroProgress();
                resolve();
              });
          };
          img.onerror = () => resolve();
          img.src = heroURL(i);
        });
      }

      async function heroLoadAll() {
        // Frame 0 first (LCP), then batches of 8 with 6 concurrent loaders.
        await heroLoadOne(0);
        for (let st = 1; st < heroSet.count; st += 8) {
          const batch: number[] = [];
          for (let i = st; i < Math.min(st + 8, heroSet.count); i++)
            batch.push(i);
          for (let k = 0; k < batch.length; k += 6) {
            await Promise.all(batch.slice(k, k + 6).map(heroLoadOne));
          }
        }
      }
      void heroLoadAll();

      // Scroll scrub: pin hero, scroll picks the frame (end +=400%, scrub 0.5).
      ScrollTrigger.create({
        trigger: "#hero",
        start: "top top",
        end: "+=400%",
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.round(self.progress * (heroSet.count - 1));
          if (idx !== heroShown) heroDraw(idx);
        },
      });
      const onResize = () => {
        if (heroShown >= 0) heroDraw(heroShown);
      };
      window.addEventListener("resize", onResize);

      // --- Floating padel ball (verbatim timeline) ---
      const ballWrapper = document.getElementById("scroll-ball-wrapper");
      if (ballWrapper) {
        const ballTl = gsap.timeline({
          scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
          },
        });
        ballTl
          .to(ballWrapper, {
            x: () => -window.innerWidth * 0.52,
            y: () => window.innerHeight * 0.34,
            rotation: 340,
            scale: 0.72,
            ease: "none",
          })
          .to(ballWrapper, {
            x: () => -window.innerWidth * 0.08,
            y: () => window.innerHeight * 0.62,
            rotation: 720,
            scale: 0.48,
            ease: "none",
          })
          .to(ballWrapper, {
            x: () => -window.innerWidth * 0.62,
            y: () => window.innerHeight * 0.74,
            rotation: 1080,
            scale: 0.34,
            opacity: 0.85,
            ease: "none",
          });
      }

      return () => {
        window.removeEventListener("resize", onResize);
      };
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
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

      {/* Floating padel ball layer — travels down the page on scroll */}
      <div
        id="floating-ball-layer"
        className="pointer-events-none fixed top-0 left-0 z-30 h-screen w-full overflow-hidden"
      >
        <div
          id="scroll-ball-wrapper"
          className="absolute top-[16vh] right-[6vw] flex h-24 w-24 items-center justify-center will-change-transform sm:h-28 sm:w-28 md:top-[18vh] md:right-[14vw] md:h-36 md:w-36"
        >
          <div className="pointer-events-none absolute inset-3 rounded-full bg-lime/30 blur-xl" />
          {!ballFailed && (
            <img
              id="padel-ball-img"
              src="/padel-ball.png"
              alt={hero.ballAlt}
              width={632}
              height={632}
              className="relative z-10 h-full w-full object-contain will-change-transform"
              onError={() => setBallFailed(true)}
            />
          )}
          {/* Procedural fallback if padel-ball.png fails to load */}
          <svg
            id="fallback-ball-svg"
            viewBox="0 0 200 200"
            className={`${ballFailed ? "" : "hidden"} relative z-10 h-4/5 w-4/5 drop-shadow-[0_12px_20px_rgba(14,31,26,0.45)]`}
            aria-hidden={ballFailed ? undefined : true}
          >
            <defs>
              <radialGradient id="ballFelt" cx="38%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#F6FF5E" />
                <stop offset="60%" stopColor="#D9FF3F" />
                <stop offset="100%" stopColor="#9BB816" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="88" fill="url(#ballFelt)" />
            <path
              d="M 32 58 Q 100 92 168 48"
              fill="none"
              stroke="#F3EFE6"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.9"
            />
            <path
              d="M 36 148 Q 102 118 172 138"
              fill="none"
              stroke="#F3EFE6"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.9"
            />
          </svg>
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
    </>
  );
}
