"use client";

/**
 * LocaleSwitcher — ID / EN toggle in the Nav.
 *
 * The site is bilingual (next-intl, `en` default at `/`, `id` at `/id`).
 * Plain anchors: next-intl middleware serves the right locale for the
 * path, and the switch keeps the visitor on the same page.
 */
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";

function hrefFor(pathname: string, target: "id" | "en"): string {
  // During static prerender usePathname() returns the locale segment
  // itself ("/id" / "/en"), so strip either prefix before rebuilding.
  const withoutPrefix = pathname.replace(/^\/(en|id)(?=\/|$)/, "") || "/";
  if (target === "id") {
    return withoutPrefix === "/" ? "/id" : `/id${withoutPrefix}`;
  }
  return withoutPrefix;
}

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label="Language / Bahasa"
      className="flex items-center rounded-full border border-jungle/10 bg-cream p-0.5 text-xs font-semibold"
    >
      <a
        href={hrefFor(pathname, "id")}
        aria-label="Bahasa Indonesia"
        aria-current={locale === "id" ? "true" : undefined}
        className={`rounded-full px-2.5 py-1.5 transition-colors ${
          locale === "id"
            ? "bg-jungle text-cream"
            : "text-ink/60 hover:text-jungle"
        }`}
      >
        ID
      </a>
      <a
        href={hrefFor(pathname, "en")}
        aria-label="English"
        aria-current={locale === "en" ? "true" : undefined}
        className={`rounded-full px-2.5 py-1.5 transition-colors ${
          locale === "en"
            ? "bg-jungle text-cream"
            : "text-ink/60 hover:text-jungle"
        }`}
      >
        EN
      </a>
    </div>
  );
}
