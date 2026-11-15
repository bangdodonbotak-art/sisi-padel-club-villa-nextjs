# Sisi Padel Club & Villa Bali — Architecture (Next.js 15 rebuild)

- Date: 15 Nov 2026
- Scope: rebuild of the live static site (`sisi-padel-club-villa`, 1465-line `index.html`,
  Tailwind Play CDN, GSAP + ScrollTrigger + Lenis, canvas hero 64 desktop + 48 mobile WebP frames)
  as Next.js 15 App Router, Tailwind compiled locally, Motion (motion.dev) + Lenis,
  bilingual ID (default) + EN at `/en/…`, free-tier CMS for a non-technical client.
- Deploy target: **NEW GitHub repo + NEW Vercel project as staging only.**
  Do NOT touch the live repo / live Vercel project. Switchover needs Dony's separate OK.
- Background: **PAKET 3 — SEMUA, FULL** (Dony 21:48 WIB). All six background techniques
  from the background analysis are built into the new Next.js site — see §5 for the full
  spec. This supersedes and replaces the earlier "Paket 1 only (+ structure for Paket 2/3)"
  plan in the original task brief. Constraint (§0) still stands: these background layers live
  behind / around the hero and ball without changing either.
- Playtomic is REMOVED from the new site (Dony 21:44 WIB) — booking via WhatsApp only.
  The live site keeps Playtomic until the new version replaces it.
- Research method: two models consulted via the registered connectors —
  Groq `qwen/qwen3.8-27b` (fast scan) and OpenRouter `baidu/ernie-5.5-flash-preview:free`
  (deep-think, text-only). Their answers are quoted/summarised in the Appendix.

## 0. HARD CONSTRAINT — hero + ball, 1:1, no changes (Dony 21:46 WIB)

This overrides any optimisation suggestion, including suggestions from the consulted models.

- **Hero and ball must NOT be changed — port 1:1 exactly as on the live site.**
  Canvas frame-sequence orbit, **64 desktop + 48 mobile WebP frames**, scroll pin + scrub
  behaviour identical, preloader identical, ball float behaviour identical.
- **Ball stays `padel-ball.png` (657,492 bytes). Do NOT convert it to WebP.**
  Do NOT resize, recompress, recolour, or move it.
- **Do NOT fix ball-over-text** (the ball covering text at some scroll positions is accepted as-is).
- Hero metadata text must still be readable — **only** via a scrim/pill **behind the metadata
  text itself**. Never by moving / scaling / recolouring the ball or editing hero frames.
- All other review fixes still proceed: mobile nav + sticky WhatsApp CTA, SEO plumbing,
  immutable cache headers, video autoplay deferred until in view.

Both models were re-consulted with this constraint (round 2) and confirmed it;
see Appendix §B. One consequence: for a strict 1:1 port both models switched their hero
recommendation from Motion to **GSAP ScrollTrigger** (the original driver) — see §3.

## 1. CMS — recommendation: Sanity (free tier), staged so the build is never blocked

**Recommendation in one sentence: use Sanity free tier as the CMS, with the site built
CMS-ready on local content files first so the build ships even before Dony activates Sanity.**

Why Sanity (both models agree):

- The deciding factor is "non-technical client edits without code". Local `content/*.json|mdx`
  files still need a Git commit + redeploy for every edit — the client cannot do that alone.
  An "admin stub" that writes JSON cannot persist on Vercel (read-only, ephemeral filesystem);
  routing edits through the GitHub API is brittle and overkill (ERNIE).
- Supabase is a database, not a CMS: its dashboard is tables/rows, unfriendly for editing
  prose, galleries and bilingual text, and it would need a custom admin UI built on top.
  Dony's existing Supabase projects BARFLOW and NexCreator are **INACTIVE/paused** and must
  NOT be reused — restoring them needs Dony personally (task constraint).
- Sanity gives a hosted Studio (real forms, image upload, live preview), an image CDN with
  on-the-fly transforms, per-field locale handling (`id`/`en` fields or separate documents
  per language), and a free tier ample for a club site (low traffic, few documents).
  Model each editable type as a schema: `court`, `faq`, `photo`, `hero` / locale strings.
- Git-based alternatives (Keystatic, Tina) are the fallback if Dony refuses a Sanity account:
  client edits commit to GitHub. Still second choice — Sanity is least friction (ERNIE).

### Staged rollout (so Sanity activation never blocks the build)

- **Phase 1 — ship CMS-ready:** all editable content lives in-repo as structured local files
  (`content/courts.json`, `content/faq.json`, `content/photos.json`,
  `messages/id.json` / `messages/en.json` for UI strings) behind one typed content layer
  (e.g. `lib/content.ts` with `getCourts(locale)`, `getFaq(locale)` …). The Sanity schemas
  are written in the repo at the same time, mirroring the same shapes, so swapping the
  data source is a one-file change. Include an admin stub page/route that reads the same
  content layer (read-only until Sanity is live) — do not build a write-to-JSON admin.
- **Phase 2 — Sanity live (needs Dony, see below):** point the content layer at Sanity's
  GROQ queries; keep the local files as fallback/seed data. Add webhook revalidation
  (`revalidatePath` / `revalidateTag`) only if a write token is used server-side.

### What Dony must personally do to activate Sanity (cannot be done by Muse)

1. Create an account at **sanity.io** (sign up with email/Google — no agent can do this for him).
2. Create a **new project** (never reuse BARFLOW / NexCreator): "Start from scratch",
   note the `projectId` and `dataset` (default `production`).
3. In the project, add the schemas from the repo (`court`, `faq`, `photo`, `hero`, locale strings)
   — either via the Studio in the repo (`sanity` CLI / `sanity.config.ts`) or by pasting them
   in the Sanity dashboard.
4. Project Settings → API → generate a **read-only API token** (production).
   A write token is needed ONLY if using server actions / webhook revalidation — keep it
   server-side only, never `NEXT_PUBLIC_*`, never in the client bundle.
5. In Sanity → API → CORS origins, add the Vercel staging domain (and later the production domain).
6. In Vercel (new staging project) → Environment Variables, set:
   `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`,
   `SANITY_API_READ_TOKEN` (and `SANITY_API_WRITE_TOKEN` only if step 4's write token exists).
   No token, password or account is ever to be pasted in chat or invented by the agent.
7. Tell Muse the project is created — Muse then wires the content layer to Sanity and verifies
   a courts/FAQ/photo edit round-trips to the staging site.

If Dony does not do these steps, the site still ships and is fully editable by a developer
via the local content files; the client just cannot self-edit yet. That is the honest
trade-off, and it is why Phase 1 exists.

## 2. i18n — next-intl with `[locale]`, `localePrefix: 'as-needed'`

**Recommendation: `next-intl`, not a hand-rolled `[locale]` dictionary.**

- Both models agree. A hand-rolled dictionary is fine for a dozen UI strings, but it means
  reinventing routing, message formatting, and — critically — `hreflang` / alternates for SEO.
- `next-intl` is App Router-native: middleware for locale detection/redirect, `generateStaticParams`
  for SSG, `setRequestLocale`, and built-in `alternates` metadata.
- Configure `localePrefix: 'as-needed'` so Indonesian (default) serves at `/` with **no** `/id`
  prefix (avoids duplicate content) and English at `/en/…`, exactly as specified.
- Structure: one route tree under `app/[locale]/`; UI strings in `messages/id.json` /
  `messages/en.json` (`useTranslations()` in components); CMS content (courts, FAQ, photos)
  stays separate, keyed by `locale` in Sanity / local files.
- Set `<html lang>` via `setRequestLocale`; per-locale `generateMetadata` with
  `alternates.languages` (hreflang), per-locale canonical, `sitemap.ts`, `robots.ts`,
  JSON-LD (`SportsActivityLocation` / `LocalBusiness`) fed from CMS content where possible.
- This also fixes the review finding "SEO kosong" (no OG/canonical/JSON-LD, robots+sitemap 404).

## 3. Hero — GSAP ScrollTrigger for the 1:1 port; Motion for everything else

**Recommendation: keep GSAP ScrollTrigger for the hero canvas only; use Motion for all
other animation (background aurora/grain, reveals, marquee). One driver per surface —
never mix Motion + ScrollTrigger on the same scroll.**

Why the split (and why it changed between rounds):

- Round 1 (no constraint) both models said Motion `useScroll` + `useTransform` — cleaner in
  React, declarative, no manual cleanup.
- Round 2 (with the 1:1 constraint) both models switched to **GSAP ScrollTrigger**:
  the governing rule for a strict port is to match the original library and its exact
  easing/scrub values; recreating "equivalent" Motion tweens will drift. ScrollTrigger maps
  pin/scrub most directly (`pin`, scroll-distance `end`, `scrub`) and reproduces orbit timing
  most faithfully (ERNIE). Qwen round 2: "Use GSAP ScrollTrigger … for stricter control over
  scrubbing (linear mapping of scroll position to ball/port movement), ensuring pixel-perfect
  1:1 parity with the original trajectory and easing."

What must be preserved exactly (copy verbatim from the live site, do not re-tune):

- Frame counts **64 desktop / 48 mobile** and the breakpoint that swaps them
  (`gsap.matchMedia` or a resize guard). No re-sampling, no re-export.
- Frame index = `clamp(floor(progress × frameCount), 0, frameCount − 1)` — same rounding.
- Pin length (vh/px scroll distance) and scrub smoothing value (`scrub: true` vs a number).
- Preloader that decodes/preloads frames before reveal; same threshold/timeout.
- Ball PNG layer: same file (`public/padel-ball.png`, 657,492 B), same z-order, same float
  timing/amplitude — driven independently, untouched by the scroll math.
- Canvas DPR sizing and `drawImage` behaviour; `img.decode()` before draw.

React/Next.js integration (the part that can break the 1:1 port):

- Hero is a client component (`'use client'`), rendered client-only:
  `dynamic(() => import('./HeroCanvas'), { ssr: false })` or a mounted guard, so SSR never
  renders a different frame index than the client (hydration mismatch / flicker).
- Register triggers in `useLayoutEffect`, not `useEffect`; wrap in `gsap.context()` and
  `ctx.revert()` on cleanup — this covers StrictMode double-invocation and prevents stale
  pin spacers / double-registered triggers after App Router navigation (ERNIE round 2).
  ScrollTrigger's pin spacer is injected outside React's control; a re-render or navigation
  can leave a stale spacer and break the pin.
- Lenis drives native window scroll: wire it with `requestAnimationFrame`, initialise once
  in `useEffect` with cleanup (no duplicate instances on HMR), and do **not** let any
  ScrollTrigger also hijack scroll. Kill Lenis + Motion values in cleanup.
- Preload smartly (current ±N frames, not all 112 at once) to control memory and first paint;
  canvas frames are raw `/public` WebP drawn via `drawImage` — `next/image` does not optimise them.
  Use `next/image` for CMS/photos with explicit `sizes`/dimensions to avoid CLS.
- The ball is an LCP element: preloading it is allowed (it changes no bytes, no file, no position).

## 4. Cache headers — `next.config.ts` `headers()`, immutable (safe here because assets are frozen)

**Recommendation: the pattern both models gave is correct. Ship it verbatim.**

```ts
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/hero/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};
export default nextConfig;
```

Notes / caveats:

- `immutable` is only safe when the URL changes whenever the content changes. That holds
  here **because the hero frames and the ball PNG are frozen by the §0 constraint**
  (fixed filenames, fixed bytes) — a 1-year immutable cache is acceptable (ERNIE round 2).
- If a frame or the ball is ever swapped later, either put the new sequence under a versioned
  folder (e.g. `/hero/v1/` → `/hero/v2/`, so replacing the sequence means a path change) or
  drop `immutable` and use `max-age=3600, stale-while-revalidate=86400`.
- Vercel already sends immutable headers for `/_next/static` — no extra config needed there.
- This fixes the review finding "cache max-age=0" (first load ~3.8 MB frames + 657 KB ball
  + 5.5 MB video, re-downloaded every visit).
- Frames live under `public/hero/` (desktop/mobile subfolders, as in the current repo),
  photos/video under `public/assets/`; keep those paths so the header sources match.

## 5. Everything else — fixes that proceed unchanged

- **Tailwind compiled locally (no Play CDN).** The CDN is a single point of failure and
  generates classes at runtime; compiled Tailwind only emits classes it finds in scanned
  source. Port the CDN `tailwind.config` (custom colours — turf red `#C1272D` — fonts, plugins)
  to the real config. Watch out: Tailwind v4 uses CSS-first config, not `tailwind.config.js`.
  Dynamically-built classes (template literals like `` `bg-${color}` ``) get purged — refactor
  to full literal class names or a safelist.
- **Mobile nav + sticky WhatsApp CTA** (review score: HP 72, "tanpa navigasi/hamburger/sticky CTA").
  Fixed CTA: `fixed bottom-4 right-4`, high `z-index`, pad for `env(safe-area-inset-bottom)` on iOS;
  verify a fixed/absolute canvas does not stack over the CTA (check `z-index` and `pointer-events`)
  and that the CTA does not cover FAQ/footer content.
- **SEO plumbing:** per-locale `generateMetadata`, OG tags, canonical, `alternates.languages`,
  `sitemap.ts`, `robots.ts`, JSON-LD — see §2.
- **Video autoplay deferred until in view:** `IntersectionObserver`-gated autoplay
  (do not autoplay the 5.5 MB villa reel on load); `preload="none"` + `poster` until in view,
  then `play()`. Muted + `playsInline` for iOS.
- **Hero metadata readability:** scrim/pill **behind the metadata text only** (§0).
  Nothing else in the hero changes.
- **Background — PAKET 3 FULL (Dony 21:48 WIB, all six techniques, in the new Next.js site):**
  1. **Grain/noise overlay ~4% site-wide** (CSS/SVG noise, fixed overlay).
  2. **Aurora blobs** — lime + turf-red blobs drifting slowly over the jungle background.
  3. **Scroll-driven background colour transitions** — sand → turf red → jungle → sand → jungle,
     implemented as **crossfade between layers, NOT animating `background-color` per frame**.
  4. **Marquee band "STAY • PLAY • BREATHE •" as a divider at every section** — this also
     closes the ~250–300 px dark dead band above the footer (between Visit and marquee).
  5. **Parallax layers** — giant outline "SISI" wordmark + court-line / palm SVG, moving slower
     than the content.
  6. **Cursor-following lime glow, desktop only** — off on mobile and off under
     `prefers-reduced-motion`.
  All six use **~0 KB of new assets and only the 4 Sisi colours**. Motion (not GSAP) drives
  these background layers; the hero keeps its own GSAP driver (§3) — one driver per surface.
  **Constraint:** these layers live behind / around the hero and ball and must not change
  either of them (§0).

## 6. Deployment

- **NEW GitHub repo** (suggested name: `sisi-padel-club-villa-nextjs`) + **NEW Vercel project
  as staging only.** Never create accounts/credentials/logins for Dony; the repo/project
  creation itself is a Dony-side action or an explicit next step for the coordinator —
  this doc does not assume it exists yet.
- Env vars on Vercel staging: Sanity vars from §1 (only after Dony activates Sanity);
  no secrets in the repo, no `.env.local` committed.
- Verify on staging before any switchover talk: hero frame-for-frame vs live (desktop +
  mobile), ball identical, nav/CTA on a real phone, SEO tags present on `/` and `/en`,
  cache headers on `/hero/*` and `/assets/*` (check with `curl -I`), video does not autoplay
  off-screen.
- Flag: the proposal + PPT currently say "static HTML" and mention Playtomic; both need
  updating once the Next.js version ships (Playtomic removal + framework change).

## 7. Migration watch-list (things that would break)

- **Tailwind CDN → compiled:** purged dynamic classes, CDN-only config, `<style>`-tag custom CSS
  must move to `globals.css` / real config. Never use the CDN in Next.js.
- **Hydration mismatches:** no `Date` / `toLocaleDateString`, `Math.random`, or browser APIs
  during SSR; format dates in client components or deterministically; hero is client-only (§3).
- **Animation conflicts:** one driver per surface. Mixing Lenis + Motion + leftover ScrollTrigger
  triple-drives scroll. Remove GSAP entirely except the hero; guard StrictMode double-invoke.
- **Frames vs `next/image`:** canvas frames bypass `next/image`; preload ±N only.
  CMS photos use `next/image` with `sizes`; mind free-tier image-transform limits.
- **SEO:** see §2 — hard-coded meta tags in static HTML become per-locale `generateMetadata`.
- **Locale routing:** confirm ID resolves at `/` (no `/id`) to avoid duplicate content.
- **Ball/hero regression:** any "improvement" to the hero or ball is a scope violation (§0).
  Verify by comparing staging hero frame-by-frame against live, not by eyeballing once.

---

## Appendix A — Model consultations, round 1 (before the §0 constraint)

Prompt: the five questions (a) CMS Sanity vs Supabase vs local files, (b) `[locale]` dictionary
vs next-intl, (c) Motion `useScroll`/`useTransform` vs GSAP ScrollTrigger, (d) immutable cache
headers for `/hero/*` and `/assets/*`, (e) migration breakage risks — for the rebuild described
in the header. Full prompts kept in `/tmp/sisi-arch-prompt.txt` (ephemeral).

### A1. Groq — `qwen/qwen3.8-27b` (2,317 total tokens, ~5.9 s)

- **(a) CMS: Sanity.** "For a non-technical client managing bilingual content (ID/EN) with
  dynamic arrays (courts, FAQ, photos), Sanity's structured content model and visual editing
  capabilities far outperform local JSON/MDX files (which still require code commits/deployments
  to update) and Supabase (which is primarily a database, not a headless CMS, and requires
  building custom UIs for content management)." Bilingual via language fields in the schema;
  free tier generous for a club site. User must: sign up at sanity.io, create a new project
  (never reuse BARFLOW/NexCreator), upload the provided schema for `court`/`faq`/`hero`/`text`,
  generate a Production Read-Only API Token for `NEXT_PUBLIC_SANITY_API_TOKEN` in `.env.local`.
- **(b) i18n: next-intl with App Router.** Handles middleware locale negotiation, message
  management, avoids duplicating layouts and hydration mismatches of manual `[locale]` routing;
  `useTranslations()` hooks; store translations in Sanity or local JSON.
- **(c) Hero: Motion `useScroll` + `useTransform`.** "Since you are moving to Next.js/React,
  using GSAP inside `useEffect` creates a 'bridge' problem. GSAP instances must be manually
  cleaned up on unmount, and scroll triggers can conflict with React's rendering cycle."
  Example given: `useScroll({ target: heroRef, offset: ["start start", "end end"] })`,
  `frameIndex = useTransform(scrollYProgress, [0, 1], [0, 63])`. Keep Lenis; "Motion works
  perfectly with Lenis's virtual scroll."
- **(d) Cache headers:** the exact `next.config.js` `headers()` pattern in §4
  (`/hero/:path*` and `/assets/:path*`, `public, max-age=31536000, immutable`), "safe to cache
  immutably" since frames are versioned by filename.
- **(e) Risks:** Tailwind CDN → compiled (move arbitrary values/custom CSS to `globals.css` /
  `tailwind.config.js`, never use the CDN in Next.js); hydration mismatches — wrap the canvas
  hero in `dynamic(..., { ssr: false })`, avoid `Date.now()`/`Math.random()` in initial render;
  GSAP/Lenis conflicts — remove GSAP entirely if using Motion, `ScrollTrigger.refresh()` on
  resize if keeping it, Lenis in `useEffect` with cleanup for HMR; Sanity images need
  `cdn.sanity.io` in `images.remotes`; SEO needs per-page `generateMetadata` + sitemap/robots
  for both `/` and `/en`; sticky WhatsApp CTA — test `z-index` / `fixed bottom-4 right-4` on mobile.

### A2. OpenRouter — `baidu/ernie-5.5-flash-preview:free` (4,160 total tokens, cost 0)

- **(a) CMS: Sanity free tier.** "The deciding factor is 'non-technical client edits without
  code,' which rules out plain local files: on Vercel the filesystem is read-only and ephemeral,
  so an 'admin stub' that writes JSON won't persist unless you route edits through the GitHub
  API — brittle and overkill. Supabase works but its dashboard is DB-shaped (tables/rows), not
  friendly for editing prose and galleries, and your two existing projects are paused."
  Sanity gives hosted Studio, image CDN, per-field locale handling. User must personally:
  create account + project (gives `projectId` + `dataset`); generate a read token (write token
  only if using server actions/webhook revalidation); store as Vercel env vars; add the Vercel
  domain to CORS origins; set `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`,
  `SANITY_API_READ_TOKEN`. Git-based alternative if keeping everything in-repo: Keystatic or Tina.
- **(b) i18n: next-intl with a `[locale]` segment.** "A dictionary is fine for a dozen UI strings
  but you'd reinvent routing, message formatting, and — critically — `hreflang`/alternates for SEO."
  `localePrefix: 'as-needed'` so ID serves at `/` with no prefix and EN at `/en/...`; UI strings
  in `messages/id.json` / `messages/en.json`; CMS content separate; one route tree under `app/[locale]/`.
- **(c) Hero: Motion `useScroll` + CSS sticky.** "GSAP ScrollTrigger pins by mutating the DOM,
  which fights React reconciliation and double-fires under StrictMode." Pattern: tall scroll
  region (`h-[400vh]`) + `sticky top-0 h-screen` wrapper + canvas; `useMotionValueEvent(scrollYProgress,
  'change', …)` drawing only when the frame index changes; handle `devicePixelRatio`,
  `img.decode()` before draw; Lenis drives native window scroll so `scrollYProgress` reads correctly.
- **(d) Cache headers:** correct pattern (the `next.config.ts` snippet in §4) — "but `immutable`
  is only safe when the URL changes whenever the content changes (content-hashed or versioned
  paths). Your fixed hero frames (`frame-001.webp`…) qualify as long as you bump a version folder
  when re-exporting." If not versioned, drop `immutable` for `max-age=3600,
  stale-while-revalidate=86400`. "Put versioned frames under `/hero/v1/`."
- **(e) Risks:** Tailwind CDN → compiled — dynamically-built classes (`` `bg-${color}` ``) get
  purged, port CDN config (note Tailwind v4 is CSS-first, not `tailwind.config.js`); hydration —
  avoid `Date`/`Math.random`/browser APIs in SSR, set `lang` via `setRequestLocale`; pick one
  animation driver, kill Lenis/Motion values in `useEffect` cleanup, guard StrictMode double-invoke;
  frames vs `next/image` — preload current ±N, not all 112 at once; `next/image` for CMS photos
  with explicit `sizes`; SEO — `generateMetadata` per locale, `alternates.languages`, `sitemap.ts`,
  `robots.ts`, per-locale canonical, JSON-LD (`SportsActivityLocation`/`LocalBusiness`); sticky
  WhatsApp CTA / mobile nav — canvas can stack over the CTA, check `z-index`/`pointer-events`,
  pad for `env(safe-area-inset-bottom)`; confirm ID resolves at `/` (no `/id`).

## Appendix B — Model consultations, round 2 (with the §0 hard constraint)

Follow-up prompt: hero + ball port 1:1, ball stays `padel-ball.png` (657,492 B), no WebP
conversion, no ball-over-text fix, metadata readability only via scrim/pill behind the text.
Full prompt kept in `/tmp/sisi-arch-prompt2.txt` (ephemeral).

### B1. OpenRouter — `baidu/ernie-5.5-flash-preview:free` (3,347 total tokens, cost 0)

1. **Hero-port:** "The constraint doesn't change the tooling decision, but for a strict 1:1 port
   I hold to GSAP ScrollTrigger over Motion's useScroll/useTransform — provided the live site
   was built on GSAP. The governing rule: match the original library and its exact easing/scrub
   values; recreating 'equivalent' Motion tweens will drift." Preserve exactly: frame count
   64/48 and the breakpoint that swaps them, frame index `clamp(floor(progress × frameCount),
   0, frameCount−1)`, pin length and scrub smoothing copied verbatim, preloader decode/preload
   threshold, ball PNG layer (same file, z-order, float timing/amplitude, driven independently),
   canvas DPR sizing and `drawImage` behaviour.
2. **Cache headers:** stand for `/hero/*` and `/assets/*`, "with one caveat tied to fixed
   (non-hashed) filenames: a 1-year `immutable` is only safe if you guarantee those exact bytes
   never change. Since the client freezes the ball and frames, that's acceptable." If a frame
   or the ball could ever be swapped, change the filename or fall back to
   `max-age=…, stale-while-revalidate` + ETag. Preload the ball since it is an LCP element.
3. **What changes:** "Ball: no WebP conversion, no resize/recompress — padel-ball.png at
   657,492 bytes ships as-is (preloading it is still fine). No ball-over-text fix: accepted.
   Metadata readability is solved only by a scrim/pill behind the text — never by moving/scaling/
   recolouring the ball or editing hero frames. Unaffected, proceed as planned: CMS, i18n, SEO
   plumbing, and video-defer (IntersectionObserver-gated autoplay), plus mobile nav and sticky
   WhatsApp CTA."
4. **One React/Next risk:** "The ScrollTrigger pin spacer versus React's reconciler. Pinning
   injects a wrapper/spacer and sets transforms outside React's control; a re-render, hydration,
   or App Router navigation can leave a stale spacer or a double-registered trigger, breaking
   the 1:1 pin. Mitigate with: 'use client' plus client-only canvas (dynamic import ssr:false
   or a mounted guard), register triggers in useLayoutEffect (not useEffect), and revert via
   gsap.context() / ctx.revert() on cleanup — which also covers StrictMode's double-invoke."

### B2. Groq — `qwen/qwen3.8-27b` (round 2; first two attempts failed, see note)

- **Hero port:** "Preserve the exact DOM structure, CSS classes, and initial layout metrics.
  Use GSAP ScrollTrigger instead of `useScroll` for stricter control over scrubbing (linear
  mapping of scroll position to ball/port movement), ensuring pixel-perfect 1:1 parity with the
  original trajectory and easing. Keep ball asset as `padel-ball.png` (657492 bytes); do not
  convert to WebP or alter its z-index/position relative to text."
- **Cache headers:** "Yes, `/hero/*` and `/assets/*` headers remain unchanged. Maintain
  `Cache-Control: public, max-age=31536000, immutable` for static canvas frames and critical
  assets to ensure the preloader and initial paint are identical to production."
- **Other changes:** "Only the metadata readability overlay changes: add a scrim/pill background
  behind metadata text. No other visual, layout, or animation changes are permitted. Canvas frame
  counts (64 desktop, 48 mobile) and WebP formats for frames stay fixed."
- **React/Next risk:** "Hydration mismatch due to scroll position. If `useScroll` or client-side
  detection runs after server-side render, the initial state may differ. Mitigate by rendering
  the ball/port at their starting position on the server and only attaching scroll listeners/handlers
  in `useEffect` to ensure SSR and client DOM match exactly before animation begins."
- **Reliability note:** the first round-2 Groq call failed HTTP 429 (output-tokens-per-minute
  limit 1000, requested 1843) and a later probe returned HTTP 503 (Qwen over capacity); the
  short-prompt retry then succeeded. A `gpt-oss-20b` fallback call (same short prompt) also
  succeeded and agreed: "No frame count, file names, or ball image (`padel-ball.png`, 657,492
  bytes) may change. Maintain the same WebP frames, preloader logic, and the scrim/pill behind
  metadata text for readability" — quoted here only as corroboration, the Qwen answer above
  is the recorded Groq consultation.

### Synthesis note (where the models disagreed)

- **Hero driver:** round 1 both said Motion; round 2 (under the 1:1 constraint) both said
  GSAP ScrollTrigger. This doc follows round 2 — the constraint is the deciding factor —
  and confines GSAP to the hero only, with Motion for all other animation.
- **CMS / i18n / cache headers:** both models agreed in both rounds (Sanity; next-intl
  `as-needed`; `next.config` immutable headers). No disagreement to resolve.
- **Qwen round-1 token note:** Qwen's round-1 claim that the Sanity token goes in
  `NEXT_PUBLIC_SANITY_API_TOKEN` is not followed — a read token is fine as a public env var
  only if it is genuinely read-only; this doc uses `SANITY_API_READ_TOKEN` (server) +
  `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET`, per ERNIE and standard practice.
