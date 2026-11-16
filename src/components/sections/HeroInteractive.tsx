"use client";

/**
 * HeroInteractive — client-only hero behaviour.
 *
 * Stage 1 (verbatim dari Hero lama): preloader counter/ball, frame
 * sequence 64/48 WebP scrub (GSAP ScrollTrigger pin +=400%, scrub 0.5),
 * dan ball travel timeline (rotation 340° → 720° → 1080°).
 * Loaded with dynamic(ssr:false) via HeroLoader; it takes over the DOM
 * nodes rendered by HeroShell (ids: preloader, hero-canvas,
 * hero-first-frame, scroll-ball-wrapper) after mount.
 *
 * Stage 2 (rebuild-stage-2-plan.md) — yang berubah HANYA di sini:
 * - Gate 3D via getThreeTier(): tier "off" ATAU prefers-reduced-motion
 *   → TIDAK ADA layer 3D sama sekali, perilaku lama persis.
 * - Shared ref heroScroll { t, invalidate }: SATU ScrollTrigger hero
 *   yang sudah ada menulis heroScroll.t di onUpdate. Saat 3D AKTIF,
 *   onUpdate TIDAK memanggil heroDraw (canvas 2D tersembunyi) — kamera
 *   3D baca ref itu di useFrame. Saat NONAKTIF, perilaku lama persis.
 * - Crossfade: setelah gate lolos + Canvas render frame pertama,
 *   opacity layer 3D 0→1 (~600 ms) DAN opacity canvas 2D 1→0.
 *   WebGL context lost → balik ke 2D (opacity 3D 0, 2D 1 + redraw).
 * - DOM ball (#scroll-ball-wrapper): opacity 0 selama 3D AKTIF +
 *   pin progress < 1; muncul lagi setelah pin lepas. Timeline
 *   GSAP-nya TIDAK diubah.
 * - Tombol pause DOM (bukan di dalam Canvas) di kanan bawah hero,
 *   di atas sticky WA bar. Pause = bekukan intro + pantulan bola;
 *   kamera ikut scroll + bola gelinding tetap jalan.
 * - Layer 3D + tombol di-portal ke dalam <section id="hero"> supaya
 *   positioning absolutnya nempel ke hero (HeroLoader dirender sebagai
 *   sibling section, bukan di dalamnya).
 *
 * DO NOT CHANGE the frame sequence, pin/scrub values, preloader, or ball
 * timeline — only the loading boundary moved (see HeroShell) + Stage 2
 * wiring above.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  getThreeTier,
  prefersReducedMotion,
} from "@/lib/three/gate";
import type { HeroScrollState, ThreeTier } from "@/lib/three/gate";

// Dynamic ssr:false: three/R3F HANYA masuk chunk async (First Load JS
// route /[locale] harus tetap ~171 kB — jangan import three statis).
const HeroCourt3D = dynamic(
  () => import("@/components/three/HeroCourt3D"),
  { ssr: false },
);

export default function HeroInteractive({
  ballAlt,
  pauseMotion,
  resumeMotion,
}: {
  ballAlt: string;
  pauseMotion: string;
  resumeMotion: string;
}) {
  const [ballFailed, setBallFailed] = useState(false);

  // --- Stage 2 state ---
  // heroScroll: SATU source of truth scroll progress (kontrak plan).
  // Objeknya stabil seumur hidup komponen; ScrollTrigger menulis .t,
  // kamera 3D + bola 3D hanya MEMBACA-nya di useFrame.
  const heroScrollRef = useRef<HeroScrollState>({ t: 0 });
  const [threeTier, setThreeTier] = useState<ThreeTier | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [crossfaded, setCrossfaded] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [paused, setPaused] = useState(false);
  const [heroEl, setHeroEl] = useState<HTMLElement | null>(null);
  // Mirror is3DOn ke ref supaya closure onUpdate ScrollTrigger (yang
  // dibuat sekali di useLayoutEffect) selalu baca nilai terbaru.
  const is3DOnRef = useRef(false);
  // Dipanggil saat balik ke 2D (context lost) untuk menggambar ulang
  // frame sesuai posisi scroll saat ini; diisi di dalam gsap.context.
  const redraw2DRef = useRef<() => void>(() => {});

  const threeActive =
    threeTier !== null && threeTier !== "off" && !reducedMotion;
  const is3DOn = threeActive && crossfaded && !contextLost;

  useEffect(() => {
    is3DOnRef.current = is3DOn;
  }, [is3DOn]);

  // Gate 3D (client-only) + cari <section id="hero"> buat portal.
  useEffect(() => {
    setHeroEl(document.getElementById("hero"));
    const rm = prefersReducedMotion();
    setReducedMotion(rm);
    setThreeTier(rm ? "off" : getThreeTier());
  }, []);

  // Crossfade 2D ↔ 3D. Saat 3D tampil, canvas 2D di-opacity-0 (tetap
  // di DOM sebagai fallback); saat balik ke 2D, opacity 1 + redraw
  // frame terakhir supaya tidak blank.
  useEffect(() => {
    const canvas = document.getElementById(
      "hero-canvas",
    ) as HTMLCanvasElement | null;
    if (!canvas) return;
    canvas.style.transition = "opacity 600ms ease";
    canvas.style.opacity = is3DOn ? "0" : "1";
    if (!is3DOn) redraw2DRef.current();
  }, [is3DOn]);

  // DOM ball: sembunyikan juga saat is3DOn berubah TANPA scroll (mis. baru
  // crossfade di load) — onUpdate ScrollTrigger hanya jalan saat scroll,
  // jadi tanpa effect ini bola DOM sempat dobel dengan bola 3D di load.
  // POLISH 16 Nov 2026: sembunyikan selama 3D AKTIF — TANPA batas progress.
  // Dulu bola muncul lagi setelah pin lepas (progress >= 1) dan melayang
  // di atas section berikutnya (terlihat seperti kesalahan di atas viewer).
  // Mode 2D (is3DOn false) tidak berubah: bola tetap jalan seperti biasa.
  useEffect(() => {
    const ballWrapper = document.getElementById("scroll-ball-wrapper");
    if (!ballWrapper) return;
    ballWrapper.style.opacity = is3DOn ? "0" : "";
  }, [is3DOn]);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const rm = window.matchMedia(
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
      if (rm) {
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

      // Dipakai HeroInteractive saat balik dari 3D ke 2D (context lost).
      redraw2DRef.current = () => {
        if (heroShown >= 0) heroDraw(heroShown);
      };

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

      // DOM ball wrapper — dipakai onUpdate hero untuk hide/show (Stage 2).
      const ballWrapper = document.getElementById("scroll-ball-wrapper");

      // Scroll scrub: pin hero, scroll picks the frame (end +=400%, scrub 0.5).
      // NOTE (Stage 1, item 10): NO autoplay intro tween here, deliberately.
      // The scrub owns the frame via ScrollTrigger progress + heroShown; a
      // tween calling heroDraw() directly would desync heroShown from the
      // scrub progress, so the first scroll would snap the frame back to
      // ~0 (visible rewind). Animating real scroll instead would hijack
      // the user's scroll position on load. Left for a scroll-driven
      // solution in a later stage, if at all.
      // Stage 2: onUpdate JUGA menulis shared ref heroScroll.t — satu
      // source of truth untuk kamera 3D + bola 3D. Saat 3D AKTIF,
      // heroDraw dilewati (canvas 2D tersembunyi) dan sebagai gantinya
      // R3F di-invalidate (frameloop demand).
      ScrollTrigger.create({
        trigger: "#hero",
        start: "top top",
        end: "+=400%",
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          heroScrollRef.current.t = self.progress;
          // DOM ball disembunyikan selama 3D AKTIF (tanpa batas progress —
          // POLISH: dulu muncul lagi setelah pin lepas dan melayang di
          // atas viewer). Timeline GSAP ball-nya sendiri TIDAK diubah.
          if (ballWrapper) {
            ballWrapper.style.opacity = is3DOnRef.current ? "0" : "";
          }
          if (is3DOnRef.current) {
            heroScrollRef.current.invalidate?.();
            return;
          }
          const idx = Math.round(self.progress * (heroSet.count - 1));
          if (idx !== heroShown) heroDraw(idx);
        },
      });
      const onResize = () => {
        if (heroShown >= 0) heroDraw(heroShown);
      };
      window.addEventListener("resize", onResize);

      // --- Floating padel ball (verbatim timeline) ---
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
      <div
        id="floating-ball-layer"
        className="pointer-events-none fixed top-0 left-0 z-30 h-screen w-full overflow-hidden"
      >
        <div
          id="scroll-ball-wrapper"
          className="absolute top-[24vh] right-[6vw] flex h-16 w-16 items-center justify-center will-change-transform sm:h-20 sm:w-20 md:top-[18vh] md:right-[14vw] md:h-28 md:w-28"
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

      {/* Stage 2 — layer 3D + tombol pause, di-portal ke dalam #hero.
          Hanya saat gate lolos (tier full/lite + bukan reduced-motion):
          tier "off" / reduced-motion → tidak ada layer 3D sama sekali,
          perilaku lama persis. Tombol render bareng HeroInteractive
          (bukan di dalam Canvas) supaya terlihat + bisa diklik sebelum
          chunk 3D selesai load. */}
      {heroEl &&
        threeActive &&
        threeTier !== null &&
        createPortal(
          <>
            <div
              id="hero-3d-layer"
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 z-[5] transition-opacity duration-700 ${
                is3DOn ? "opacity-100" : "opacity-0"
              }`}
            >
              <HeroCourt3D
                heroScroll={heroScrollRef.current}
                tier={threeTier}
                paused={paused}
                onFirstFrame={() => setCrossfaded(true)}
                onContextLost={() => {
                  setContextLost(true);
                  setCrossfaded(false);
                }}
                onContextRestored={() => {
                  setContextLost(false);
                  setCrossfaded(true);
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              className="absolute right-4 bottom-24 z-30 rounded-full border border-sand/25 bg-jungle/70 px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-sand uppercase backdrop-blur transition-opacity hover:opacity-90 md:right-6 md:bottom-8"
            >
              {paused ? resumeMotion : pauseMotion}
            </button>
          </>,
          heroEl,
        )}
    </>
  );
}
