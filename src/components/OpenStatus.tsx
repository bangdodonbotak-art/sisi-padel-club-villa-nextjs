"use client";

/**
 * OpenStatus — live open/closed pill for the sticky nav (Stage 1).
 *
 * Club hours 08:00–21:30 WITA (Asia/Makassar), every day. The status is
 * computed client-side AFTER mount (render null during SSR) so the
 * server-rendered HTML never disagrees with the visitor's clock
 * (no hydration mismatch). The clock refreshes every 60 seconds.
 *
 * Desktop (sm+): full pill — glowing dot + status text + live HH:MM WITA.
 * Mobile: dot only (the pill's accessible name still carries the status).
 * Reduced motion: static dot, no pulse (matchMedia check here + the
 * CSS media query on .neon-status-dot in globals.css).
 */
import { useEffect, useState } from "react";

const OPEN_MINUTES = 8 * 60; // 08:00
const CLOSE_MINUTES = 21 * 60 + 30; // 21:30

function getWitaParts(now: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Makassar",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  // Some environments report midnight as hour "24" — normalise it to 0.
  const hour =
    Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const minute = Number(
    parts.find((p) => p.type === "minute")?.value ?? "0",
  );
  return { hour, minute };
}

type OpenStatusProps = {
  statusOpen: string;
  statusClosed: string;
  statusAriaOpen: string;
  statusAriaClosed: string;
};

export default function OpenStatus({
  statusOpen,
  statusClosed,
  statusAriaOpen,
  statusAriaClosed,
}: OpenStatusProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => {
      window.clearInterval(id);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  if (!mounted || !now) return null;

  const { hour, minute } = getWitaParts(now);
  const totalMinutes = hour * 60 + minute;
  const isOpen = totalMinutes >= OPEN_MINUTES && totalMinutes < CLOSE_MINUTES;
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={isOpen ? statusAriaOpen : statusAriaClosed}
      className="flex items-center gap-2 rounded-full border border-jungle/10 bg-cream px-2.5 py-2 sm:px-3"
    >
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
          isOpen
            ? reducedMotion
              ? "bg-lime"
              : "neon-status-dot bg-lime"
            : "bg-jungle/30"
        }`}
      />
      <span className="hidden text-xs font-semibold whitespace-nowrap text-jungle sm:inline">
        {isOpen ? statusOpen : statusClosed}
      </span>
      <span className="hidden font-mono text-xs text-jungle/60 sm:inline">
        {hh}:{mm} WITA
      </span>
    </span>
  );
}
