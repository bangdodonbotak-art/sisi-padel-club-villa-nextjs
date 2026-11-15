# Verification Report — Sisi Padel Club & Villa Bali Next.js Rebuild

- **Date:** Sun 2026-11-15 ~15:08–15:25 WIB
- **Scope:** `~/workspace/sisi-nextjs/` (independent verification; no source files modified)
- **Server used:** `next start -p 3100` (production build, killed after checks)
- **Browser:** real Chromium via Playwright + local relay proxy `127.0.0.1:18080` (`HOME=~/workspace/chromium-proxy-test/chrome-home`, strict certs; `browse.py` strict check passed first). Localhost bypassed the proxy (`bypass: localhost,127.0.0.1`) — without it Chromium got `ERR_EMPTY_RESPONSE` on `localhost:3100`.
- **Screenshots:** `docs/verification-shots/` (28 PNGs)

## Overall verdict: FAIL (narrow — 3 small, fixable defects)

Everything structural passes: build, all routes, zero Playtomic, all required content, hero canvas paints, ball round, no overflow, no console errors, videos defer + play correctly, ball/frame counts exact. The FAIL rests on check 4: **two Indonesian strings leak onto `/en`** (one visible in the Stay caption, one in a `wa.me` prefill link), plus a **mobile footer defect** (sticky WhatsApp bar covers the footer's last line at max scroll). All three are one-line-ish fixes; nothing here requires a rebuild or redesign.

## PASS/FAIL table

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Fresh build `npm run build` | **PASS** | Exit code **0**. Compiled in 4.1s, 10/10 static pages. Routes: `/[locale]` → `/id`, `/en`; `/[locale]/admin` → `/id/admin`, `/en/admin`; `/robots.txt`; `/sitemap.xml`; `/_not-found`. First Load JS 171 kB (`/[locale]`), 103 kB shared. 3 non-blocking ESLint warnings only: `no-page-custom-font` (layout.tsx:120) + 2× `no-img-element` (Hero.tsx:304, 355). |
| 2 | Production server + status codes + cache headers | **PASS** | `next start -p 3100` Ready in 847 ms. All **200**: `/`, `/en`, `/admin`, `/en/admin`, `/robots.txt`, `/sitemap.xml`, `/hero/desktop/0001.webp`, `/padel-ball.png`. `Cache-Control: public, max-age=31536000, immutable` confirmed on **both** `/hero/desktop/0001.webp` (72,030 B, `image/webp`) and `/padel-ball.png` (657,492 B, `image/png`). |
| 3 | Zero Playtomic | **PASS** | `grep -ri playtomic` over `src/ content/ messages/ public/` + root config files: **0**. Repo-wide grep excluding `node_modules/.next/docs/`: **0**. Rendered HTML `curl /` and `/en`: **0** each (case-insensitive). |
| 4 | Rendered HTML content (`/` + `/en`) | **FAIL** | All required strings present on **both** locales (1 occurrence each in SSR HTML): `STAY. PLAY.`, `Chat WhatsApp`, `PANORAMIC RED TURF`, `THE SISI VIBE`, `BOOK YOUR SESSION`, `VISIT SISI`, `FREQUENTLY ASKED`, `08111592462`, `+62 821-2544-6099`, JSON-LD `SportsActivityLocation` (with `LocalBusiness`, correct coords/address; `/en` description is English, `/` is Indonesian). Canonical present on both. hreflang present: body `<link rel="alternate" hrefLang="id"/"en">` + HTTP `Link` header with `id`, `en`, `x-default`. **But 2 Indonesian leaks on `/en`** (see Issues #1–#2). All main headings on `/en` are English; a ~90-word Indonesian scan of visible `/en` text found only these. |
| 5 | Screenshots (real Chromium, desktop 1920×1080 + mobile 720×1280, all 10 sections + footer) | **PASS** (with notes) | All 10 sections + footer render on both viewports; every screenshot viewed. Hero canvas painted: non-white pixel fraction **0.837** desktop (1920×1134), **0.716** mobile (720×1344), **0.837** on `/` (id) — not blank. Ball visible + round: `#padel-ball-img` complete, natural 632×632, 144×144 desktop at (1507,194), 112×112 mobile at (565,205), opacity 1. Overflow: `scrollWidth - clientWidth` = **0 px** desktop and mobile (also 0 after menu interaction). Mobile hamburger opens full menu (MANIFESTO/COURTS/VIBE/STAY/SESSIONS/FAQ/VISIT + close X) — `mobile-en-12-menu-open.png`. Sticky WhatsApp bar visible on mobile: fixed 720×44 at y=1236, text "💬Chat WhatsApp 08111592462". Hero metadata line legible on both (verified with 2× zoom crop): `PEJENG KELOD, TAMPAKSIRING · GIANYAR REGENCY, BALI 80552 · -8.49769243, 115.30430716` — the pill fully contains the wrapped 2nd line on mobile (initial glance suggested clipping; zoom proves it is inside). Visit→footer gap: **0 px desktop**; **64 px mobile** — uniform dark-green section padding, **not** a 250–300 px dead dark band. Notes: scroll-ball transiently covers words at some scroll stops (see #5); mobile footer bottom line obscured (see #3). |
| 6 | Console errors | **PASS** | **0 console errors, 0 page errors** across desktop `/en`, mobile `/en`, and desktop `/` runs. No favicon 404 either. 4 `requestfailed` entries only: both `.mp4` files `net::ERR_ABORTED` — proven benign (see #7): the videos return HTTP **206** range responses and play; the aborts are the browser cancelling superseded range fetches when a video pauses/leaves view. |
| 7 | Video deferral | **PASS** | Both videos go through `src/components/sections/DeferredVideo.tsx`: `preload="metadata"`, **no** `autoplay` attribute, `IntersectionObserver` (threshold 0.25) → `play()` in view / `pause()` out of view; used by Vibe slide 8 (`padel-21s.mp4`, 20.8 s) and Stay villa reel (`villa-reel-DLpdFaCJz3HW-13s.mp4`, 12.7 s). Runtime-verified: at load both `paused: true, currentTime: 0, readyState: 4, error: null`; villa reel advanced 3.51 → 6.52 s while in view and froze at 6.53 s out of view; padel video advanced 7.48 → 10.48 s over 3 s on slide 8. Files serve 200 via curl (3,003,422 B and 2,493,045 B). |
| 8 | Ball + hero freeze | **PASS** | `public/padel-ball.png` = **657,492 B** exactly. Hero frames: **64** desktop (`public/hero/desktop/`), **48** mobile (`public/hero/mobile/`). |

## Ranked issues

### Blocking (fix before calling `/en` / mobile done)

1. **Indonesian caption visible on `/en` — Stay section.** `content/photos.json`, `en.villaReel.caption`: `"Villa Sisi Ubud — video dari @sisipadelclub"`. Rendered visibly under the villa video on `/en` (see `desktop-en-06-stay.png`, caption line under the first Stay card). Fix: `"video from @sisipadelclub"`.
2. **Indonesian WhatsApp prefill on `/en` — Stay CTA.** `messages/en.json`, `stay.ctaUrl`: `https://wa.me/628111592462?text=Halo%20Sisi%20Padel%20Club%2C%20saya%20mau%20tanya%20ketersediaan%20villa.` — present 3× in served `/en` HTML. Invisible until tapped, but an English user tapping it sends an Indonesian message. Fix: English prefill, e.g. `Hello Sisi Padel Club, I'd like to ask about villa availability.`
3. **Mobile footer bottom line hidden behind the sticky WhatsApp bar.** At absolute page bottom (mobile, `scrollY` = maxScroll 17,839), the footer's last line `Google: +62 821-2544-6099` is cut mid-glyph by the fixed 44 px sticky bar, and the address line's 2nd line (`Regency, Bali 80552`) is also clipped (see `mobile-en-13-footer-bottom.png`; footer bottom = viewport bottom 1280, sticky bar top = 1236). Fix: add bottom padding / safe-area clearance to the footer on mobile (`md:` breakpoint and below) so the last line clears the sticky bar.

### Nice-to-have

4. **Scroll-ball transiently covers copy at some scroll stops.** The floating `#padel-ball-img` travels down the page and, at the exact scroll positions captured, covers: "IN" of `MAIN COURT` (Courts), part of the Vibe marquee (`…BALI`), the "O" of `ROOFED OUTDOOR` (Manifesto), and "of-" in Booking's intro ("club's [ball]ficial number"). It moves with scrolling so it is never permanently hidden, but a reader paused at those stops sees a word obscured. Consider constraining the ball's path to gutters/margins or lowering its z-index under text.
5. **Mobile Booking hours pill wraps.** The `08:00–21:30` pill in the WhatsApp composer header wraps to two lines (`08:00–` / `21:30`) at 720 px (see `mobile-en-09-booking.png`). Cosmetic; add `whitespace-nowrap` / smaller text.
6. **Build warnings (non-blocking).** `no-page-custom-font` in `src/app/[locale]/layout.tsx:120`; `no-img-element` in `Hero.tsx:304, 355` (hero `<img>`s — deliberate for LCP/frame 1, likely fine to leave, but the warnings will recur on every build).
7. **Mobile Visit→footer gap is 64 px vs 0 px desktop.** Not a defect — uniform dark-green padding, no dead band — but the asymmetry is worth a glance if the footer spacing is ever tuned.

## Screenshot inventory (`docs/verification-shots/`)

- Desktop `/en` (1920×1080): `desktop-en-00-top.png`, `desktop-en-01-hero.png`, `desktop-en-02-clubstrip.png`, `desktop-en-03-manifesto.png`, `desktop-en-04-courts.png`, `desktop-en-05-vibe.png`, `desktop-en-06-stay.png`, `desktop-en-07-sessions.png`, `desktop-en-08-faq.png`, `desktop-en-09-booking.png`, `desktop-en-10-visit.png`, `desktop-en-11-footer.png`, `desktop-en-13-vibe-video-slide.png` (carousel swiped to video slide 8, playing)
- Desktop `/` (id) hero: `desktop-id-00-top.png`
- Mobile `/en` (720×1280): `mobile-en-00-top.png`, `mobile-en-01-hero.png`, `mobile-en-02-clubstrip.png`, `mobile-en-03-manifesto.png`, `mobile-en-04-courts.png`, `mobile-en-05-vibe.png`, `mobile-en-06-stay.png`, `mobile-en-07-sessions.png`, `mobile-en-08-faq.png`, `mobile-en-09-booking.png`, `mobile-en-10-visit.png`, `mobile-en-11-footer.png`, `mobile-en-12-menu-open.png` (hamburger open), `mobile-en-13-footer-bottom.png` (absolute page bottom, shows issue #3)

## Method notes / caveats

- The hero is a pinned scroll-driven frame sequence: `#hero` is ~5,454 px tall on desktop (club-strip starts at y=5,528) and ~6,464 px on mobile; section tops measured in the run (desktop: hero 74, club-strip 5528, manifesto 5738, courts 7596, vibe 9074, stay 10189, plans 11781, faq 12745, booking 13436, visit 14210, footer 15055).
- Screenshots were taken via `scrollIntoView` per section + 1.4 s settle; Lenis smooth-scroll was active, so a few shots catch mid-animation states (e.g. manifesto text mid-reveal, ball mid-flight) — judged accordingly, not as defects.
- `/admin` and `/en/admin` return 200 (per spec); their rendered content was not audited beyond status.
- Raw evidence (saved HTML, Playwright JSON): `/tmp/sisi-verify/` (`id.html`, `en.html`, `playwright-results.json`, `followup.json`) — ephemeral; the durable record is this report + the screenshots.
