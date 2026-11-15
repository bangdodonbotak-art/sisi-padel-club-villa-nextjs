"use client";

/**
 * DeferredVideo — a <video> that does NOT autoplay until it scrolls into
 * view (contract §4.9 / architecture §5). preload="metadata" until in
 * view, then play(); muted + loop + playsInline. Pauses again when it
 * leaves the viewport.
 */
import { useEffect, useRef, useState } from "react";

export default function DeferredVideo({
  src,
  ariaLabel,
  className = "",
}: {
  src: string;
  ariaLabel: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setInView(entries[0]?.isIntersecting ?? false);
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (inView) {
      void el.play().catch(() => {
        /* autoplay blocked — user can tap to play; never throw */
      });
    } else {
      el.pause();
    }
  }, [inView]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={ariaLabel}
      className={className}
    />
  );
}
