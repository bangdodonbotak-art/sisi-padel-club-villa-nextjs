# Deploy status — Sisi Padel Club & Villa Bali (Next.js rebuild)

Date: 15 Nov 2026. Work dir: `~/workspace/sisi-nextjs/`. Live static site untouched.

## Build status: DONE and verified

- Next.js 15.5.29, React 19.3.1, Tailwind v4 (local), next-intl 4.15.1, Motion 14.14.0, Lenis 1.3.27, GSAP 3.15.1, Sanity 6.23.0 (schemas only, no project).
- `npm run build` exit 0. Routes: `/`, `/en`, `/admin`, `/en/admin`, `/robots.txt`, `/sitemap.xml`.
- All 10 sections ported (hero 1:1, club-strip, manifesto, courts, vibe, stay, sessions, FAQ, booking, visit) + footer/marquee + mobile hamburger nav + mobile sticky WhatsApp bar.
- Background Paket 3 (Dony 21:48 WIB): grain ~4%, aurora blobs, scroll crossfade, marquee dividers, parallax layers, cursor glow (desktop only).
- Zero Playtomic in code and rendered HTML (`grep -ri playtomic` over src/ content/ messages/ public/ = 0). Only docs/content-spec.md + docs/architecture.md mention it as the removal record.
- Hero + ball frozen 1:1 (Dony 21:46 WIB): same 64 desktop + 48 mobile frames, same pin/scrub/preloader, same padel-ball.png (657,492 B). No ball-over-text fix, no WebP conversion.
- Independent verification: `docs/verification.md` (overall FAIL-narrow on first pass, 3 defects) → all 3 fixed + re-verified with screenshots (`docs/verification-shots/fix-*.png`): EN caption "video from @sisipadelclub", EN WhatsApp prefill, mobile footer clearance (54 px), booking pill nowrap.
- Bilingual: ID at `/`, EN at `/en/…` (next-intl, localePrefix 'as-needed').
- CMS: Sanity free tier recommended (see `docs/architecture.md` §1). Site ships CMS-ready on local files (`content/*.json` + `messages/*.json` behind `src/lib/content.ts`) + Sanity schemas in `sanity/`. No accounts/tokens created.

## Deploy status: BLOCKED — two actions need the parent / Dony

### Blocker 1 — GitHub repo cannot be created by the agent
- Attempted: MCP `create_repository` for `sisi-padel-club-villa-nextjs` (public).
- Result: `403 Resource not accessible by integration` (POST https://api.github.com/user/repos).
- Cause: the GitHub App token cannot create repositories. Confirmed the repo does not exist (search total_count 0).
- UNBLOCK: create the empty PUBLIC repo `sisi-padel-club-villa-nextjs` under `bangdodonbotak-art` via the GitHub web UI (or a browser task). Then push the text source with the snapshot procedure below.

### Blocker 2 — Vercel project cannot be created by the agent
- Attempted: MCP `create_project` for `sisi-padel-club-villa-nextjs` (framework nextjs), twice (with and without slug `bangdodonbotak-art`).
- Result: `403 forbidden — Not authorized: Trying to access resource under scope "bangdodon". You must re-authenticate to this scope.` teamId `team_BvJWmZSadmPofqxEgSo97uIf`. Recovery named `authorize_team_access`, but that tool does NOT exist in this MCP wrapper (checked the full tool list: only list_teams/get_team/list_team_members).
- Cause: the Vercel MCP connection has identity/session scopes only, no access to the "bangdodon" team scope (the account's default team; user bangdodonbotak-art / bangdodonbotak@gmail.com, Hobby plan).
- UNBLOCK (either): (a) Dony re-authorizes/grants team access for the Vercel connector (Settings → Connectors → Vercel), then retry `create_project`; or (b) create the project via the Vercel dashboard web UI (import the repo once Blocker 1 is cleared, or deploy from files).

## After both blockers clear — deploy sequence

1. Push text source to the new repo via the GitHub snapshot procedure (`/opt/hatch/connectors/github/references/snapshot-push.md`): manifest at `/tmp/sisi-nextjs-manifest-nul` — REGENERATE it at push time (files changed since). Selection: all files EXCEPT `node_modules/`, `.next/`, `public/hero/`, `public/assets/`, `public/padel-ball.png`, `src/app/favicon.ico` (binary), `docs/verification-shots/` (audit PNGs, ~15 MB — would push the snapshot over the 16 MiB limit). Expected text payload ~2 MB, ~65 files.
2. Upload binary assets to the repo (push_files cannot carry binaries): `public/hero/desktop` (64 WebP), `public/hero/mobile` (48), `public/assets/photos` (12 JPG), `public/assets/videos` (2 MP4), `public/padel-ball.png` (657,492 B), `src/app/favicon.ico` — via GitHub web UI upload (max ~25 files per browser task, ~6 batches). Alternative: deploy to Vercel first via `upload_file` (base64, one per file) + `create_deployment` with SHA1 references, so staging goes live even before the repo holds the binaries.
3. Create/link the Vercel project (`sisi-padel-club-villa-nextjs`, framework nextjs) to the repo → auto-deploy → staging URL. Set env `NEXT_PUBLIC_SITE_URL` to the staging URL (metadataBase/OG/canonical currently default to `https://sisi-padel-club-villa-nextjs.vercel.app`).
4. Verify staging live: curl `/` + `/en` (200), check hero canvas painted + ball, mobile nav, zero Playtomic, no console errors (same checklist as `docs/verification.md`).

## What still needs Dony's decision (not blockers for staging)

- Switchover: replace the live static site with this build — needs his separate OK after reviewing staging.
- Sanity activation (7 steps in `docs/architecture.md` §1): account → new project → add schemas → read-only token → CORS origins → Vercel env vars → tell Muse. Until then the client cannot self-edit; a developer edits `content/*.json` + `messages/*.json`.
- Proposal + PPT still mention Playtomic and say "static HTML" — now out of sync with the new build (zero Playtomic, Next.js). Offered update, not yet decided.
- Background package: decided (Paket 3 full, built). No further package decision needed.
