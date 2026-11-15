"use client";

/**
 * LenisProvider — smooth scroll, initialised exactly once (contract §4.8).
 *
 * Lenis drives native window scroll via a requestAnimationFrame loop, so
 * Motion `useScroll` and GSAP ScrollTrigger both read real scroll position.
 * No ScrollTrigger hijacks scroll; the lenis 'scroll' listener only calls
 * ScrollTrigger.update() to keep the hero pin in sync.
 * Skipped entirely under prefers-reduced-motion. A module-level guard
 * prevents duplicate instances across StrictMode / HMR re-mounts.
 */
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let lenisInstance: Lenis | null = null;

export default function LenisProvider() {
  useEffect(() => {
    if (lenisInstance) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisInstance = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    let rafId = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return null;
}
