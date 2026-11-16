/**
 * Footer — giant wordmark, bottom line, WhatsApp + Google links, marquee.
 *
 * No dead band: the footer follows the page end directly (no extra spacer
 * above it). The marquee sequence is rendered twice for a seamless loop.
 * No booking-platform link anywhere.
 */
import type { SiteMessages } from "@/lib/content";

export default function Footer({ footer }: { footer: SiteMessages["footer"] }) {
  // messages.footer.marquee already holds the sequence twice; the loop
  // needs exactly one sequence per copy, so slice to the first 5 items.
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
    <footer className="bg-jungle pb-16 text-cream md:pb-0">
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
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {footer.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target={link.url.startsWith("http") ? "_blank" : undefined}
                  rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="font-medium text-cream transition-colors hover:text-lime"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
