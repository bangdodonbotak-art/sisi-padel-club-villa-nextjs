"use client";

/**
 * Nav — desktop pill nav (7 links) + mobile hamburger menu.
 *
 * No chat CTA here any more — the single floating WhatsApp button
 * (FloatingWhatsApp) is the only chat button on the site (Dony 12:16).
 * The wordmark carries the lime dot from the source site.
 */
import { useState } from "react";
import type { SiteMessages } from "@/lib/content";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import MusicToggle from "@/components/MusicToggle";
import OpenStatus from "@/components/OpenStatus";

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
          <OpenStatus
            statusOpen={nav.statusOpen}
            statusClosed={nav.statusClosed}
            statusAriaOpen={nav.statusAriaOpen}
            statusAriaClosed={nav.statusAriaClosed}
          />
          <MusicToggle />
          <LocaleSwitcher />

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
          <div className="mt-3 flex justify-start px-3 pb-1">
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
