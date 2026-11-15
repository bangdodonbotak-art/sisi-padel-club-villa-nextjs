"use client";

/**
 * HeroLoader — client wrapper so the Hero can be loaded with
 * dynamic(..., { ssr: false }) (not allowed directly in a Server
 * Component). The Hero itself stays client-only: SSR never renders a
 * different frame index than the client.
 */
import dynamic from "next/dynamic";
import type { SiteMessages } from "@/lib/content";

const Hero = dynamic(() => import("./Hero"), { ssr: false });

export default function HeroLoader({
  hero,
  preloader,
}: {
  hero: SiteMessages["hero"];
  preloader: SiteMessages["preloader"];
}) {
  return <Hero hero={hero} preloader={preloader} />;
}
