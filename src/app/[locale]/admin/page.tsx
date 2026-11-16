/**
 * Admin stub — READ-ONLY (architecture.md §1, Phase 1).
 *
 * Lists the current content exactly as the content layer serves it
 * (courts, FAQ, photos) so Dony can see what the site is showing.
 * Nothing here edits or writes anything: on Vercel the filesystem is
 * read-only and ephemeral, so a write-to-JSON admin would not persist.
 *
 * To activate self-editing (Sanity, Phase 2) Dony must personally:
 *   1. Create an account at sanity.io (sign up with email/Google).
 *   2. Create a NEW project ("Start from scratch") and note the
 *      projectId and dataset (default: production). Never reuse the
 *      paused Supabase projects BARFLOW / NexCreator.
 *   3. Add the schemas from the repo (court, faq, photo, hero, locale
 *      strings) — via the Studio (sanity CLI / sanity.config.ts) or by
 *      pasting them in the Sanity dashboard.
 *   4. Project Settings → API → generate a read-only API token
 *      (production). A write token is needed ONLY for server actions /
 *      webhook revalidation — keep it server-side only, never
 *      NEXT_PUBLIC_*, never in the client bundle.
 *   5. In Sanity → API → CORS origins, add the Vercel staging domain
 *      (and later the production domain).
 *   6. In Vercel → Environment Variables, set
 *      NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and
 *      SANITY_API_READ_TOKEN (plus SANITY_API_WRITE_TOKEN only if a
 *      write token exists from step 4).
 *   7. Tell Muse the project is created — Muse then wires the content
 *      layer to Sanity and verifies an edit round-trips to staging.
 *
 * Until then the site keeps reading the local content files
 * (content/*.json + messages/*.json); the build never blocks.
 */
import type { Metadata } from "next";
import {
  getCourts,
  getFaq,
  getPhotos,
  getSite,
  siteFacts,
  type Locale,
} from "@/lib/content";

// SEO audit 2026-11-16: the admin stub is a read-only internal tool —
// it must not be indexed. (Do NOT add a robots.txt Disallow for it:
// blocking crawl would prevent Google from ever seeing this noindex.)
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const SANITY_STEPS = [
  "1. Create an account at sanity.io (sign up with email/Google).",
  "2. Create a NEW project (Start from scratch); note projectId and dataset (default: production). Never reuse BARFLOW / NexCreator.",
  "3. Add the repo schemas (court, faq, photo, hero, locale strings) via the Studio or the Sanity dashboard.",
  "4. Project Settings → API → generate a read-only API token (production). A write token is needed ONLY for server actions / webhook revalidation — server-side only.",
  "5. In Sanity → API → CORS origins, add the Vercel staging domain (and later the production domain).",
  "6. In Vercel → Environment Variables, set NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_READ_TOKEN (plus SANITY_API_WRITE_TOKEN only if one exists).",
  "7. Tell Muse the project is created — Muse wires the content layer to Sanity and verifies an edit round-trips to staging.",
];

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc: Locale = locale === "en" ? "en" : "id";
  const courts = getCourts(loc);
  const faq = getFaq(loc);
  const photos = getPhotos(loc);
  const site = getSite(loc);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <p className="font-display text-sm font-semibold tracking-[0.2em] text-turf uppercase">
        Admin stub — read-only
      </p>
      <h1 className="font-display mt-2 text-4xl font-bold sm:text-5xl">
        Current site content
      </h1>
      <p className="mt-3 max-w-2xl text-ink/75">
        This page only reads the content layer — it cannot edit anything.
        To let the club edit content without code, activate Sanity (steps
        below). Until then, edits are made by a developer in{" "}
        <code className="rounded bg-jungle/10 px-1.5 py-0.5 text-sm">
          content/*.json
        </code>{" "}
        and{" "}
        <code className="rounded bg-jungle/10 px-1.5 py-0.5 text-sm">
          messages/*.json
        </code>
        .
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold">
          Courts ({courts.length})
        </h2>
        <ul className="mt-4 space-y-3">
          {courts.map((court) => (
            <li
              key={court.id}
              className="rounded-2xl border border-jungle/15 bg-cream p-5"
            >
              <p className="font-semibold">
                {court.badge} — {court.title}
              </p>
              <p className="mt-1 text-sm text-ink/75">{court.body}</p>
              <p className="mt-2 text-xs text-ink/60">
                Photo: <code>{court.photo}</code> · Alt: {court.photoAlt}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold">
          FAQ — {faq.tabs.length} tabs, {faq.items.length} questions
        </h2>
        <ul className="mt-4 space-y-3">
          {faq.tabs.map((tab) => (
            <li
              key={tab.id}
              className="rounded-2xl border border-jungle/15 bg-cream p-5"
            >
              <p className="font-semibold">{tab.label}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/75">
                {faq.items
                  .filter((item) => item.tab === tab.id)
                  .map((item) => (
                    <li key={item.id}>{item.question}</li>
                  ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold">
          Photos — {photos.vibe.length} vibe slides, {photos.stay.length}{" "}
          stay photos
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          {photos.vibe.map((slide) => (
            <li
              key={slide.id}
              className="rounded-xl border border-jungle/15 bg-cream px-4 py-3"
            >
              {slide.label} — <code>{slide.src}</code> · {slide.caption}
            </li>
          ))}
          {photos.stay.map((photo) => (
            <li
              key={photo.id}
              className="rounded-xl border border-jungle/15 bg-cream px-4 py-3"
            >
              Stay: {photo.id} — <code>{photo.src}</code> · {photo.alt}
            </li>
          ))}
          <li className="rounded-xl border border-jungle/15 bg-cream px-4 py-3">
            Villa reel — <code>{photos.villaReel.src}</code> ·{" "}
            {photos.villaReel.caption}
          </li>
        </ul>
      </section>

      <section className="mt-10 rounded-3xl border border-jungle/15 bg-jungle p-6 text-sand sm:p-8">
        <h2 className="font-display text-2xl font-bold">
          Sanity activation steps (Dony only)
        </h2>
        <p className="mt-2 text-sm text-sand/75">
          Hero headline on this build: {site.hero.headlineLine1}{" "}
          {site.hero.headlineLine2} · WhatsApp:{" "}
          <a href={siteFacts.whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline">Chat WhatsApp ↗</a>
        </p>
        <ol className="mt-4 space-y-2 text-sm leading-relaxed text-sand/85">
          {SANITY_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
