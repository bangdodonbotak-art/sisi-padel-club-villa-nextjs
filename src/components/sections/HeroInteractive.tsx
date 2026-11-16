"use client";

/**
 * HeroInteractive — client-only hero behaviour (verbatim from the old Hero).
 *
 * Renders the floating ball layer and runs the whole useLayoutEffect:
 * preloader counter/ball animation, frame-sequence loading + scroll scrub
 * (GSAP ScrollTrigger pin, end '+=400%', scrub 0.5), and the ball travel
 * timeline (rotation 340° → 720° → 1080°, scale 0.72 → 0.48 → 0.34).
 * Loaded with dynamic(ssr:false) via HeroLoader; it takes over the DOM
 * nodes rendered by HeroShell (ids: preloader, hero-canvas,
 * hero-first-frame, scroll-ball-wrapper) after mount.
 *
 * DO NOT CHANGE the frame sequence, pin/scrub values, preloader, or ball
 * behaviour — only the loading boundary moved (see HeroShell).
 *
 * Exceptions on Dony's direct order, 17 Nov 2026 ~02:21 WIB (from his phone
 * screenshots): (1) ball scale locked at 1 through the whole travel — it
 * used to shrink 1 -> 0.72 -> 0.48 -> 0.34 and looked tiny once scrolled;
 * (2) mobile frame-0 focus shift in heroDraw so the model starts centred
 * on portrait phones instead of right-of-centre.
 */
import { useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function HeroInteractive({ ballAlt }: { ballAlt: string }) {
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
        // Mobile focus shift (Dony 17 Nov 2026, 02:20 WIB): at scroll 0 the
        // model renders right-of-centre (~55%) on a portrait phone, because
        // the centred cover-crop of the 864x1080 mobile frame cuts the left
        // side. Shift the draw left by 20 CSS px at frame 0 so her torso
        // lands on the centre line, fading to 0 by frame 16 (cosine) — by
        // then the orbit has carried her left anyway, and a constant shift
        // would push her out of frame late in the sequence (frame 48 has
        // her at the far left edge). Desktop untouched; the <img> first
        // frame in HeroShell carries the matching object-position.
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const focusShift = heroIsMobile
          ? i < 16
            ? 20 * dpr * 0.5 * (1 + Math.cos((Math.PI * i) / 16))
            : 0
          : 0;
        ctx2d.drawImage(img, (cw - dw) / 2 - focusShift, (ch - dh) / 2, dw, dh);
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
      // NOTE (Stage 1, item 10): NO autoplay intro tween here, deliberately.
      // The scrub owns the frame via ScrollTrigger progress + heroShown; a
      // tween calling heroDraw() directly would desync heroShown from the
      // scrub progress, so the first scroll would snap the frame back to
      // ~0 (visible rewind). Animating real scroll instead would hijack
      // the user's scroll position on load. Left for a scroll-driven
      // solution in a later stage, if at all.
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
        // Ball travel (verbatim positions/rotation) — but scale LOCKED at 1
        // on Dony's order 17 Nov 2026 02:21 WIB ("bola terlalu kecil, buat
        // normal aja"): the old 1 -> 0.72 -> 0.48 -> 0.34 shrink left it ~22px
        // on mobile once scrolled. Size now stays the normal 64px (mobile) /
        // 56px (desktop) through the whole page; only position/rotation move.
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
            scale: 1,
            ease: "none",
          })
          .to(ballWrapper, {
            x: () => -window.innerWidth * 0.08,
            y: () => window.innerHeight * 0.62,
            rotation: 720,
            scale: 1,
            ease: "none",
          })
          .to(ballWrapper, {
            x: () => -window.innerWidth * 0.62,
            y: () => window.innerHeight * 0.74,
            rotation: 1080,
            scale: 1,
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
    <div
      id="floating-ball-layer"
      className="pointer-events-none fixed top-0 left-0 z-30 h-screen w-full overflow-hidden"
    >
      <div
        id="scroll-ball-wrapper"
        className="absolute top-[24vh] right-[6vw] flex h-16 w-16 items-center justify-center will-change-transform sm:h-20 sm:w-20 md:top-[18vh] md:right-[14vw] md:h-14 md:w-14"
      >
        <div className="pointer-events-none absolute inset-3 rounded-full bg-lime/30 blur-xl" />
        {!ballFailed && (
          <img
            id="padel-ball-img"
            src="/padel-ball.png"
            alt={ballAlt}
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
  );
}
