/**
 * Footer — giant wordmark, bottom line, marquee.
 *
 * No contact links here any more — the Google contact is deleted and
 * WhatsApp is only the single floating button (Dony 12:15 + 12:16).
 * No dead band: the footer follows the page end directly (no extra
 * spacer above it). The marquee sequence is rendered twice for a
 * seamless loop. No booking-platform link anywhere.
 */
import type { SiteMessages } from "@/lib/content";

export default function Footer({ footer }: { footer: SiteMessages["footer"] }) {
  // messages.footer.marquee holds one sequence of 5 items; the loop
  // renders it twice for a seamless marquee.
  const sequence = footer.marquee.slice(0, 5);

  const marqueeRow = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {sequence.map((item) => (
        <span
          key={`${hidden}-${item}`}
          className="font-display px-6 text-xl font-bold tracking-wide whitespace-nowrap text-cream uppercase sm:text-2xl"
        >
          {item}
          <span className="pl-12 text-lime">●</span>
        </span>
      ))}
    </div>
  );

  return (
    <footer className="text-cream">
      {/* Footer marquee */}
      <div aria-label="Sisi Padel Club & Villa Bali" className="overflow-hidden border-b border-cream/10 py-4">
        <div className="animate-marquee flex w-max">
          {marqueeRow(false)}
          {marqueeRow(true)}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6">
        <p className="font-display text-[9vw] leading-[0.9] font-bold tracking-tight text-cream uppercase sm:text-7xl">
          {footer.wordmark}
          <span className="text-lime">.</span>
        </p>

        <div className="mt-10 flex flex-col gap-4 border-t border-cream/15 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-cream/70">{footer.bottomLeft}</p>
        </div>
      </div>
    </footer>
  );
}
