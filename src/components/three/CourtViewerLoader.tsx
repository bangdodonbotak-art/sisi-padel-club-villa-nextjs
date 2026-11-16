"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getThreeTier, type ThreeTier } from "@/lib/three/gate";
import type { CourtViewerStrings } from "./CourtViewer";

/**
 * CourtViewerLoader — client wrapper for the 3D court viewer.
 *
 * - Decides the 3D tier on the client (getThreeTier): tier "off" renders
 *   the real court photo + fallback copy instead of an empty canvas.
 * - Lazy-loads CourtViewer (dynamic ssr:false) only once the block comes
 *   within 200px of the viewport (IntersectionObserver), so the three.js
 *   chunk is never in the first load.
 * - Pauses the viewer loop while the tab is hidden (visibilitychange) or
 *   the viewer leaves the viewport — passed down as the `paused` prop.
 *   The aspect-ratio placeholder keeps zero CLS before the viewer loads.
 */

const CourtViewer = dynamic(() => import("./CourtViewer"), { ssr: false });

export interface CourtViewerLoaderProps {
  strings: CourtViewerStrings;
  /** Real Upper court photo (from getCourts) for the tier-"off" fallback. */
  fallbackPhoto: string;
  fallbackAlt: string;
  /** courts.viewerFallback copy. */
  fallbackText: string;
}

export default function CourtViewerLoader({
  strings,
  fallbackPhoto,
  fallbackAlt,
  fallbackText,
}: CourtViewerLoaderProps) {
  const [tier, setTier] = useState<ThreeTier | null>(null);
  const [inView, setInView] = useState(false);
  const [inViewport, setInViewport] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTier(getThreeTier());
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || tier === null || tier === "off") return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false;
        setInViewport(visible);
        if (visible) setInView(true);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [tier]);

  const paused = !inViewport || !tabVisible;

  if (tier === "off") {
    return (
      <figure>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-sand/20 bg-jungle sm:aspect-[16/10]">
          <Image
            src={fallbackPhoto}
            alt={fallbackAlt}
            width={1024}
            height={640}
            loading="lazy"
            className="h-full w-full object-cover object-[center_30%]"
          />
        </div>
        <figcaption className="mt-4 text-sm text-sand/85">
          {fallbackText}
        </figcaption>
      </figure>
    );
  }

  return (
    <div ref={rootRef}>
      {tier === null || !inView ? (
        <div
          aria-hidden="true"
          className="aspect-[4/3] rounded-2xl border border-sand/20 bg-jungle/55 sm:aspect-[16/10]"
        />
      ) : (
        <CourtViewer tier={tier} paused={paused} strings={strings} />
      )}
    </div>
  );
}
