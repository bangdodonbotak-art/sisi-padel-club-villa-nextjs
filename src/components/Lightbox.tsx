"use client";

/**
 * Lightbox — fullscreen media viewer for photos + videos.
 * Close via X button / Escape / backdrop click. Prev/next via buttons,
 * arrow keys, or swipe (pointer handlers). Videos play with controls
 * inside the lightbox and pause on close/unmount. Focus moves to the
 * close button on open; body scroll is locked while open. Static
 * (no open/close animation) under prefers-reduced-motion.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface LightboxItem {
  type: "image" | "video";
  src: string;
  alt?: string;
  poster?: string;
}

export default function Lightbox({
  items,
  index,
  onClose,
}: {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const swipeStartX = useRef<number | null>(null);

  const total = items.length;
  const item = items[current];

  const go = useCallback(
    (delta: number) => {
      setCurrent((c) => (c + delta + total) % total);
    },
    [total],
  );

  // Escape closes; arrow keys navigate.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, go]);

  // Focus the close button on open + lock body scroll while open.
  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Pause the lightbox video when it unmounts (index change / close).
  useEffect(() => {
    const el = videoRef.current;
    return () => {
      el?.pause();
    };
  }, [current]);

  // Swipe (pointer) navigation on the media area.
  const onPointerDown = (e: React.PointerEvent) => {
    swipeStartX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (swipeStartX.current === null) return;
    const dx = e.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
  };

  if (!item) return null;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={item.alt ?? "Media viewer"}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-jungle/95 p-4 backdrop-blur-sm sm:p-12"
    >
      <button
        ref={closeRef}
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-sand/30 text-xl text-sand transition-colors hover:border-lime hover:text-lime focus:outline-none focus-visible:ring-2 focus-visible:ring-lime"
      >
        ✕
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => go(-1)}
            className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-sand/30 text-xl text-sand transition-colors hover:border-lime hover:text-lime focus:outline-none focus-visible:ring-2 focus-visible:ring-lime sm:left-5"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => go(1)}
            className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-sand/30 text-xl text-sand transition-colors hover:border-lime hover:text-lime focus:outline-none focus-visible:ring-2 focus-visible:ring-lime sm:right-5"
          >
            →
          </button>
        </>
      )}

      <motion.div
        key={current}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className="flex max-h-full max-w-full touch-pan-y items-center justify-center"
      >
        {item.type === "video" ? (
          <video
            key={item.src}
            ref={videoRef}
            src={item.src}
            poster={item.poster}
            controls
            autoPlay
            muted
            loop
            playsInline
            aria-label={item.alt}
            className="max-h-[82vh] w-auto max-w-full rounded-2xl object-contain"
          />
        ) : (
          <img
            key={item.src}
            src={item.src}
            alt={item.alt ?? ""}
            className="max-h-[82vh] w-auto max-w-full rounded-2xl object-contain"
          />
        )}
      </motion.div>

      {total > 1 && (
        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-jungle/70 px-3 py-1 font-mono text-xs tracking-widest text-sand/85">
          {current + 1} / {total}
        </span>
      )}
    </motion.div>
  );
}
