"use client";

/**
 * HeroLoader — client wrapper so HeroInteractive can be loaded with
 * dynamic(..., { ssr: false }) (not allowed directly in a Server
 * Component). The SEO-critical hero markup lives in HeroShell (server)
 * and is rendered by the page; this loader only mounts the interactive
 * layer (canvas frame sequence, GSAP pin/scrub, floating ball) after
 * hydration. The interactive layer takes over the shell's DOM nodes by id.
 */
import dynamic from "next/dynamic";

const HeroInteractive = dynamic(() => import("./HeroInteractive"), {
  ssr: false,
});

export default function HeroLoader({
  ballAlt,
  pauseMotion,
  resumeMotion,
}: {
  ballAlt: string;
  pauseMotion: string;
  resumeMotion: string;
}) {
  return (
    <HeroInteractive
      ballAlt={ballAlt}
      pauseMotion={pauseMotion}
      resumeMotion={resumeMotion}
    />
  );
}
