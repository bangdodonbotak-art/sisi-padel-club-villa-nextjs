# Build Contract — Sisi Padel Club & Villa Bali (Next.js rebuild)

Scaffold/core layer, built 2026-11-15. The next worker owns the sections + hero.
Read `content-spec.md` (copy — wins for all text) and `architecture.md`
(stack — wins for all technical choices) before touching anything.

## 0. What is done (this layer)

- Next.js 15.5.29 App Router + TypeScript + `src/`, Tailwind v4 (CSS-first,
  `@theme` tokens in `src/app/globals.css`), React 19.2.x.
- Deps: `next-intl` 4.x, `motion` 14.x (motion.dev), `lenis`, `gsap` 3.x.
- Assets copied (never moved) from `~/workspace/sisi-padel-club-villa/`:
  `public/hero/desktop/` 64 WebP, `public/hero/mobile/` 48 WebP,
  `public/assets/photos/` 12 JPG, `public/assets/videos/` 2 MP4,
  `public/padel-ball.png` — verified exactly 657,492 B. Source untouched.
  `hero-orbit.mp4` was NOT copied (unreferenced in the source — spec §3.7).
- i18n: `next-intl`, locales `id` (default, served at `/`) + `en` (`/en/…`),
  `localePrefix: 'as-needed'`, middleware + request config + `generateStaticParams`.
- Background Paket 3 (all six techniques) in `src/components/background/`,
  mounted site-wide behind content in `src/app/[locale]/layout.tsx`.
- Nav (desktop pill + mobile hamburger) + footer + mobile sticky WhatsApp bar.
- SEO: per-locale metadata + OG/Twitter + canonical + hreflang + JSON-LD
  (SportsActivityLocation/LocalBusiness), `robots.ts`, `sitemap.ts`.
- Cache headers: `/hero/:path*`, `/assets/:path*`, `/padel-ball.png` →
  `public, max-age=31536000, immutable`.
- Sanity schemas (Phase 1, CMS-ready): `sanity/schemaTypes/` + `sanity.config.ts`.
- `npm run build` exits 0; zero occurrences of the removed booking-platform
  brand name in the codebase
  (code, copy, comments, URLs, metadata).

## 1. Content-layer API — `src/lib/content.ts` (ONE typed layer, use it everywhere)

```ts
import { getCourts, getFaq, getPhotos, getSite, siteFacts, type Locale } from "@/lib/content";
```

| Function | Returns |
|---|---|
| `getCourts(locale)` | `Court[]` — `{ id, badge, tag, title, body, footerLabel, footerLinkLabel, photo, photoAlt }` (2 courts) |
| `getFaq(locale)` | `FaqContent` — `{ tabs: [{ id, label }], items: [{ id, tab, question, answer }] }` (4 tabs, 7 items) |
| `getPhotos(locale = "id")` | `PhotosContent` — `{ vibe: VibeSlide[8], stay: StayPhoto[3], villaReel: { src, caption, ariaLabel } }` |
| `getSite(locale)` | `SiteMessages` — the whole `messages/{locale}.json` tree, typed (nav, hero, manifesto, clubStrip, courts section strings, vibe strings, stay, sessions, booking, visit, footer, stickyBar, background, common, meta, preloader) |
| `getMessages(locale)` | Same as `getSite` — feeds `NextIntlClientProvider` |
| `siteFacts` | Locale-independent facts: businessName, address, lat/lng `-8.49769243 / 115.30430716`, mapsUrl, hours `08:00–21:30`, rating 5/26, WhatsApp `08111592462` / `https://wa.me/628111592462`, Google phone `+62 821-2544-6099` / `tel:+6282125446099` |

Sources: `content/courts.json`, `content/faq.json`, `content/photos.json`,
`messages/id.json`, `messages/en.json`. Indonesian copy is verbatim from
content-spec.md; English is an accurate translation of factual copy only.
**No prices anywhere — do not invent any.** When Sanity goes live (Phase 2),
swap the data source inside these functions only; callers keep this API.

`VibeSlide` shape: `{ id: number, kind: "image" | "video", src, label, badge,
caption, alt }`. Slide 8 is the video `/assets/videos/padel-21s.mp4`
(autoplay, muted, loop, playsinline, `preload="metadata"`).
`StayPhoto` shape: `{ id, src, alt, aspect: "4/3", span: 1 | 2 }`
(`garden-pool` spans 2 columns).

## 2. Tailwind tokens — `src/app/globals.css` (`@theme`)

| Token | Value | Classes |
|---|---|---|
| sand | `#F3EFE6` | `bg-sand`, `text-sand`, `border-sand` … |
| cream | `#F7F3EA` | `bg-cream`, `text-cream` … |
| jungle | `#0E1F1A` | `bg-jungle`, `text-jungle` … |
| ink | `#14201B` | `bg-ink`, `text-ink` … |
| lime | `#D9FF3F` (single accent) | `bg-lime`, `text-lime` … |
| turf | `#C1272D` (turf red) | `bg-turf`, `text-turf` … |
| display font | Fira Sans Extra Condensed 600/700 + Italic 600 | `font-display` |
| body font | Inter Tight 400/500/600 | `font-body` |

Fonts load via runtime Google Fonts `<link>` in
`src/app/[locale]/layout.tsx` — **never `next/font/google` in this VM**.
Marquee loop utility: `animate-marquee` (28s linear infinite, translateX −50%;
content must be rendered twice for the seamless loop).
Only these 4 Sisi colours + lime/turf accents; no other palette.

## 3. File paths this layer owns (do not rewrite without reason)

```
next.config.ts                  # next-intl plugin + immutable cache headers
src/middleware.ts               # next-intl middleware (locale routing)
src/i18n/routing.ts             # locales id/en, default id, prefix as-needed
src/i18n/request.ts             # getRequestConfig → messages/{locale}.json
src/app/layout.tsx              # minimal root layout (passes children through)
src/app/globals.css             # Tailwind v4 @theme tokens + marquee keyframes
src/app/robots.ts               # /robots.txt (sitemap URL from NEXT_PUBLIC_SITE_URL)
src/app/sitemap.ts              # / + /en with per-locale alternates
src/app/[locale]/layout.tsx     # fonts, metadata, JSON-LD, bg layers, Nav, Footer, sticky bar
src/app/[locale]/page.tsx       # TEMPORARY STUB — you replace this (see §4)
src/lib/content.ts              # typed content layer (§1)
content/courts.json  content/faq.json  content/photos.json
messages/id.json  messages/en.json
src/components/Nav.tsx         # pill nav + hamburger (7 links + WhatsApp CTA)
src/components/Footer.tsx      # wordmark + links + footer marquee (no dead band)
src/components/StickyWhatsAppBar.tsx   # mobile-only fixed bottom WA bar (≤768px)
src/components/background/Grain.tsx            # SVG-noise overlay ~4%
src/components/background/Aurora.tsx           # lime + turf-red drifting blobs
src/components/background/ScrollCrossfade.tsx  # sand → red → jungle → sand → jungle (opacity crossfade, NOT bg-color animation)
src/components/background/MarqueeDivider.tsx   # "STAY • PLAY • BREATHE •" band
src/components/background/ParallaxLayers.tsx   # giant outline "SISI" + court-line/palm SVG
src/components/background/CursorGlow.tsx       # lime cursor glow, desktop pointer:fine only, OFF under prefers-reduced-motion
sanity.config.ts                # Studio config — env only, no hard-coded projectId/dataset
sanity/schemaTypes/{localeString,court,faq,photo,hero}.ts
```

## 4. What the next worker must provide

1. **`src/components/sections/*.tsx` for all 10 sections** (IDs + copy from
   content-spec.md §2, via `getCourts` / `getFaq` / `getPhotos` / `getSite` —
   never hard-code copy that already lives in the content layer):
   `Hero`, `ClubStrip` (`#club-strip`), `Manifesto` (`#manifesto`),
   `Courts` (`#courts`, incl. 7 facilities list), `Vibe` (`#vibe`, 8-slide
   slider + vibe marquee), `Stay` (`#stay`, villa reel + 3 photos + Airbnb /
   Tiket.com cards kept SEPARATE), `Sessions` (`#plans`, 3 cards),
   `Faq` (`#faq`, 4 tabs), `Booking` (`#booking`, WhatsApp-first card +
   composer form), `Visit` (`#visit`, 2 phone cards kept SEPARATE with source
   labels). Section anchors must match the nav: `#manifesto #courts #vibe
   #stay #plans #faq #visit`.
2. **Final `src/app/[locale]/page.tsx`** — compose the 10 sections in order
   (Hero → ClubStrip → Manifesto → Courts → Vibe → Stay → Sessions → FAQ →
   Booking → Visit), with `MarqueeDivider` between sections. Delete the stub
   note when done.
3. **Hero (1:1 port, content-spec §0 + architecture §3)** — canvas frame
   sequence 64 desktop / 48 mobile WebP, GSAP ScrollTrigger pin
   (`start: 'top top'`, `end: '+=400%'`, `scrub: 0.5`), preloader counter
   00–100 from decoded frames + 3 s safety timeout, headline
   `STAY. PLAY. / Breathe.`, metadata line, subcopy, CTAs
   (`Chat WhatsApp` → `https://wa.me/628111592462`; secondary
   `atau chat WhatsApp →` → `#booking`). Client-only
   (`dynamic(..., { ssr: false })` or mounted guard), `useLayoutEffect` +
   `gsap.context()` / `ctx.revert()` cleanup. Ball: `public/padel-ball.png`
   (657,492 B — do NOT convert/resize/recolour), fixed layer, start
   `top 16vh / right 6vw` mobile, `18vh / 14vw` desktop; scrub 0.8 timeline
   rotation 340° → 720° → 1080°, scale 0.72 → 0.48 → 0.34, final opacity
   0.85; keep the procedural SVG fallback if the PNG fails to load.
   Metadata readability ONLY via a scrim/pill behind the metadata text.
4. **Vibe slider** — swipe + prev/next (`Geser ke kiri` / `Geser ke kanan`),
   `SWIPE ↔` indicator; video slide autoplays muted/loop/playsinline.
5. **FAQ tabs** — 4 tabs, tab 1 (`courts`) active by default.
6. **WhatsApp composer** — fields `wa-name` / `wa-court` (4 options, first =
   default) / `wa-date` / `wa-time` / `wa-notes`; defaults `Tamu` /
   `Fleksibel` / `Fleksibel (08:00-21:30)`; exact message template from
   messages `booking.messageTemplate` (`*{nama}*` bold, `•` bullets, notes
   line only if filled); opens
   `https://wa.me/628111592462?text={encoded}` in a new tab. **No success
   screen/text** — the old site has none; do not invent one.
7. **Visit** — address/hours/rating card + Maps button + the two phone cards
   (WhatsApp `08111592462` and Google `+62 821-2544-6099`, separate, with
   source labels). Footer follows the page end directly — no spacer, no dead band.
8. **Lenis wiring** — initialise once (client component, `requestAnimationFrame`
   loop, cleanup on unmount, no duplicate instances on HMR); Lenis drives
   native window scroll so Motion `useScroll` and GSAP ScrollTrigger both read
   it. One driver per surface: GSAP for the hero only, Motion for everything else.
9. **Video autoplay deferred until in view** — IntersectionObserver-gated
   (`preload="metadata"` until in view, then play; muted + playsInline).
   Applies to the villa reel and the Vibe video slide.
10. **Verify before claiming done** — `npm run build` exit 0; `grep -ri
    the removed booking-platform brand name` (excluding node_modules/.next) = 0; hero frame-for-frame vs the
    source clone; sticky bar never covers footer content on mobile.

## 5. Hard constraints (repeat — they bind the next worker too)

- Hero + ball are 1:1. Nothing in this layer or yours may change them.
- **NO booking-platform links anywhere** — code, copy, comments, URLs, metadata.
  Every former CTA now points to `https://wa.me/628111592462` (or `#booking`).
- No invented prices or facts. Only content-spec.md §4 facts.
- No GitHub repo / Vercel project creation; no accounts or credentials.
- Do not touch `~/workspace/sisi-padel-club-villa/` except copying from it.
- Background layers live BEHIND/AROUND the hero and ball: keep section
  backgrounds transparent where the crossfade/aurora/grain should show
  through, and keep the hero canvas + ball `z-index` above the fixed
  background stack (`z-0`) — the content wrapper in the layout is `z-10`.
