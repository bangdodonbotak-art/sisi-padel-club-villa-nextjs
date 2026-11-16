"use client";

/**
 * Nav — desktop pill nav (7 links + WhatsApp CTA) + mobile hamburger menu
 * (slide-down panel, same links + WhatsApp CTA).
 *
 * The CTA is WhatsApp only — no booking-platform link anywhere.
 * The wordmark carries the lime dot from the source site.
 */
import { useState } from "react";
import type { SiteMessages } from "@/lib/content";
import MusicToggle from "@/components/MusicToggle";

export default function Nav({ nav }: { nav: SiteMessages["nav"] }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-jungle/10 bg-cream/90 py-2 pr-2 pl-5 shadow-[0_8px_30px_rgba(14,31,26,0.08)] backdrop-blur-md"
      >
        <a
          href="#hero"
          className="font-display text-lg leading-none font-bold tracking-wide text-jungle uppercase"
        >
          {nav.wordmark}
          <span className="text-lime [-webkit-text-stroke:0.5px_#0e1f1a]">.</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-5 lg:flex">
          {nav.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-ink/80 transition-colors hover:text-turf"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <MusicToggle />
          <a
            href={nav.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-jungle transition-transform hover:scale-[1.03] sm:block"
          >
            {nav.cta}
          </a>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? nav.menuClose : nav.menuOpen}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-jungle text-cream lg:hidden"
          >
            <span aria-hidden="true" className="relative block h-3 w-5">
              <span
                className={`absolute top-0 left-0 h-0.5 w-full bg-cream transition-transform duration-300 ${open ? "translate-y-[5px] rotate-45" : ""}`}
              />
              <span
                className={`absolute top-[5px] left-0 h-0.5 w-full bg-cream transition-opacity duration-300 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`absolute top-[10px] left-0 h-0.5 w-full bg-cream transition-transform duration-300 ${open ? "-translate-y-[5px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out lg:hidden ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-jungle/10 bg-cream/95 p-4 shadow-[0_8px_30px_rgba(14,31,26,0.12)] backdrop-blur-md">
          <ul className="flex flex-col">
            {nav.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-display block rounded-xl px-3 py-3 text-xl font-semibold tracking-wide text-jungle uppercase hover:bg-sand"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={nav.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block rounded-full bg-lime px-5 py-3 text-center text-sm font-semibold text-jungle"
          >
            {nav.cta}
          </a>
        </div>
      </div>
    </header>
  );
}
