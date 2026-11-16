# Rebuild Sisi — STAGE 1: Fondasi & Perbaikan (16 Nov 2026)

> Koordinator: subagent rebuild Stage 1. Status: Stage 1 SAJA — setelah ini LAPOR ke parent
> dan TUNGGU go-ahead sebelum Stage 2. JANGAN push ke GitHub (push terpusat di parent).
> JANGAN sentuh: `MusicToggle.tsx`, `public/audio/*`, `next.config.ts` (header keamanan),
> `src/app/[locale]/layout.tsx` (SEO: H1/JSON-LD ada di HeroShell + layout),
> `src/app/sitemap.ts`, `src/app/robots.ts`, `src/middleware.ts`, `sanity/`.
> JANGAN bikin ulang `Hero.tsx` (sudah dihapus; hero sekarang `HeroShell` + `HeroInteractive`
> + `HeroLoader`). JANGAN ubah file PNG/frame hero. JANGAN karang harga/fakta.
> Zero Playtomic. CTA booking → WA 08111592462 saja. Google +62 821-2544-6099 HANYA di Visit.

## Definisi Stage 1 (asumsi koordinator — halaman review artifact tidak bisa dibaca langsung,
## jadi Stage 1 = semua pekerjaan NON-3D: perbaikan Argon + 13 item + fitur antrian a–d.
## Runtime 3D (R3F) TIDAK diinstall di Stage 1 — itu Stage 2.)

Tampilan DIPERTAHANKAN: lime #D9FF3F + jungle #0E1F1A + sand, Fira Sans, hero orbit tetap.
Bilingual ID/EN tetap. SEO + security + musik harus tetap jalan (dicek di verifikasi akhir).

## Keputusan ensemble (2 model dikonsultasi 16 Nov 09:5x WIB)
- OpenRouter `nvidia/nemotron-3-ultra-550b-a55b:free` (2193 token, cost 0)
- Groq `qwen/qwen3.8-27b` (2993 token, 4,2 dtk)
- Keduanya SETUJU: (1) marquee yang dipertahankan = **footer marquee** (satu-satunya yang
  bawa info konversi: WA + Google); hapus 4 MarqueeDivider + marquee Vibe. (2) Gabung 02+05
  + reorder + renumber (lihat bawah). (3) Neon pill di sticky nav, desktop pill penuh,
  mobile dot-only, reduced-motion = dot statis, `role="status" aria-live="polite"`.
  (4) Scale-down tipografi jalan. (5) Stage 2 = **React Three Fiber + drei**
  (bukan vanilla three.js); capability gate: WebGL2 + deviceMemory ≥ 4 +
  hardwareConcurrency ≥ 4 + bukan save-data; fisika 1 bola = **hand-rolled**
  (Verlet ~30 baris, TANPA Rapier/cannon-es — jangan install physics lib).
- TIDAK SETUJU: slot 19:30. Nemotron: hapus (mentok jam tutup). Qwen: WAJIB ada
  (prime time sore Bali, paling dicari). KEPUTUSAN KOORDINATOR: **19:30 TETAP ADA**
  (slot berakhir pas 21:30 = jam tutup; slot ini REQUEST, admin yang konfirmasi —
  tidak ada risiko kalau dimasukkan, ada risiko kehilangan permintaan prime-time
  kalau dihapus).

## Urutan halaman baru (setelah merge 02+05 + renumber)
Hero → ClubStrip → Manifesto → **02 Courts & Sessions** (Courts + Sessions berurutan,
tanpa marquee di antaranya) → **03 Vibe** → **04 Stay** → **05 FAQ** → **06 Booking** →
**07 Visit** → Footer (marquee footer TETAP).
- Anchor nav TETAP: `#courts` (section Courts), `#plans` (section Sessions) — id dipertahankan.
- Label baru (di messages, dikerjakan Agen HERO): `courts.label` = "02 / The Courts &
  Sessions" (ID+EN sama); `faq.label` 06→05; `booking.label` 07→06; `visit.label` 08→07.
  (EN: "05 / Verified Information", "06 / Reserve Your Court", "07 / Location &
  Verified Contacts".)

## Slot booking (grid 120 menit, jam 08:00–21:30)
Start: **08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 19:30** (tampil "08:00 – 10:00" dst;
19:30 tampil "19:30 – 21:30") + chip **"Fleksibel"** (default terpilih).
Slot = REQUEST, bukan ketersediaan live. Pesan WA tetap pakai template yang sama.

## Kontrak message keys BARU (dikerjakan Agen HERO di messages/id.json + en.json)
- `nav.statusOpen`: "BUKA · 08:00–21:30" / "OPEN NOW · 08:00–21:30"
- `nav.statusClosed`: "TUTUP · BUKA 08:00" / "CLOSED · OPENS 08:00"
- `nav.statusAriaOpen`: "Klub buka sekarang, 08:00 sampai 21:30 WITA" / "Club is open now, 08:00 to 21:30 WITA"
- `nav.statusAriaClosed`: "Klub tutup, buka lagi 08:00 WITA" / "Club is closed, opens again at 08:00 WITA"
- `booking.flexible`: "Fleksibel" / "Flexible"
- `booking.requestNote`: "Slot yang dipilih adalah permintaan — ketersediaan dikonfirmasi admin via WhatsApp." / "Selected slots are requests — availability is confirmed by the admin on WhatsApp."
- Label picker pakai key LAMA: `booking.fields.courtLabel` (pilih lapangan),
  `booking.fields.dateLabel` (pilih hari), `booking.fields.timeLabel` (pilih jam).

## Pembagian file (TIDAK BOLEH tabrakan — satu file satu agen)
- **Agen HERO**: `src/components/sections/HeroShell.tsx`,
  `src/components/sections/HeroInteractive.tsx`, `src/lib/content.ts` (tipe hero saja),
  `messages/id.json`, `messages/en.json` (SEMUA perubahan messages).
- **Agen SECTIONS**: `src/app/[locale]/page.tsx`, `src/components/sections/Courts.tsx`,
  `src/components/sections/Sessions.tsx`, `src/components/sections/Vibe.tsx`,
  `src/components/sections/Stay.tsx`, `src/components/sections/Visit.tsx`,
  `src/components/sections/Manifesto.tsx`, `src/components/sections/Faq.tsx`,
  `src/components/Footer.tsx`, `src/components/background/MarqueeDivider.tsx` (hapus jika tak terpakai).
- **Agen BOOKING+NEON**: `src/components/OpenStatus.tsx` (BARU),
  `src/components/Nav.tsx` (tambah pill SAJA — jangan sentuh MusicToggle/CTA/hamburger),
  `src/app/globals.css` (TAMBAH keyframe neon + reduced-motion SAJA — jangan sentuh
  keyframe eq-bar musik), `src/components/sections/Booking.tsx`.

## Aturan kerja agen implementasi
- JANGAN jalankan `npm run build` / `npm run dev` (build ditulis ke `.next` bersama —
  tabrakan antar agen). Verifikasi lokal cukup `npx tsc --noEmit` (typecheck, aman paralel).
- Koordinator yang menjalankan build + Playwright setelah semua agen lapor.
- JANGAN ubah nilai `next.config.ts`, `layout.tsx`, `sitemap.ts`, `robots.ts`.
- JANGAN ubah file di luar daftar di atas. Kalau butuh file lain, LAPOR dulu, jangan nekat.
- Setiap perubahan copy HARUS dari `docs/content-spec.md` atau pesan Dony — jangan karang.
- Lapor kembali: file yang diubah + apa yang dicek (`tsc` exit code) + hal yang diragukan.

## HASIL STAGE 1 (16 Nov 2026, ~10:00–11:05 WIB — koordinator + 3 agen paralel)

SELESAI + TERVERIFIKASI. `npm run build` exit 0, First Load JS tetap 171 kB.
Verifikasi pusat (Playwright Chromium, server lokal port 3102): ronde 1 = 31/36 PASS,
ronde 2 (setelah perbaikan CTA) = 10/10 PASS. Screenshot desktop 1280 + mobile 375
dilihat sendiri. Bukti: `/tmp/stage1-verify/` (verify.py, verify2.py, results*.json,
desktop/mobile-hero*.png, desktop/mobile-booking.png, desktop-visit.png, en-hero.png).
- SSR: H1 ada (ID+EN), FAQPage JSON-LD ada, canonical + hreflang x-default/id/en ada
  (HTML pakai `hrefLang` kapital — grep lowercase sempat false negative), /admin noindex,
  hero slice bersih (tanpa Pejeng/koordinat/meta pill), preloader tampilkan jam.
- Musik + MP3 tetap jalan (klik play → currentTime jalan, klik lagi → pause).
- Header keamanan tetap ada (CSP, HSTS, XFO DENY, nosniff, Referrer, Permissions-Policy).
- Marquee tinggal 1 (footer). Urutan section baru + label 02/05/06/07 terverifikasi.
- Booking picker: 4 chip lapangan, 8 chip hari (Fleksibel + 7), 8 chip jam (Fleksibel + 7
  slot 08:00–19:30), request note tampil; submit → URL wa.me benar
  (`...?text=Halo Sisi... Saya *Budi Test* ... Main Court ... 10:00 ...`).
- Video Vibe + Stay play saat in view (curl 200, 3,0 MB + 2,5 MB); ERR_ABORTED di ronde 1
  hanya race preload (bukan file rusak). 0 console error (di luar error font Google
  akibat relay sandbox mati — environmental, sudah ada sebelum Stage 1).
- Perbaikan koordinator saat verifikasi: hero CTA ternyata masih di bawah fold desktop
  (bottom 866) + ketutup sticky bar mobile (774–818 vs bar 756–800) — akar: nav in-flow
  74px + hero 105svh. Fix: `min-h-[105svh]` → `min-h-[100svh]`, `pb-24` → `pb-32`,
  `md:pb-12` → `md:pb-24` (HeroShell.tsx). Setelah fix: CTA desktop 730–778, mobile
  702–746 (10px di atas sticky bar) — terverifikasi angka + screenshot.
- DITUNDA/DROP di Stage 1: item 10 autoplay intro (di-SKIP sengaja — tween heroDraw
  mendesinkronkan heroShown dari scrub; butuh pendekatan scroll-driven di stage lanjutan);
  item 6 payload (ditunda sampai setelah switchover, sesuai rencana).
- TIDAK di-push. File Stage 1 (lokal, siap push terpusat — gabung dengan perubahan SEO +
  security yang juga belum di-push; lokal sudah berisi gabungan ketiganya dan build lolos):
  HeroShell, HeroInteractive, messages/id.json, messages/en.json, page.tsx, Sessions,
  Courts, Vibe, Stay, Visit, Manifesto, Faq, Footer, MarqueeDivider.tsx (DIHAPUS),
  OpenStatus.tsx (BARU), Nav.tsx, globals.css, Booking.tsx, docs/rebuild-stage-1-plan.md.
- Keputusan Stage 2 (dari ensemble): R3F + drei; capability gate WebGL2 + deviceMemory ≥ 4
  + hardwareConcurrency ≥ 4 + bukan save-data; fisika 1 bola hand-rolled (tanpa
  Rapier/cannon-es); hero 3D crossfade dari frame sequence, canvas bukan LCP, H1 tetap HTML.

## Item 13 daftar perbaikan — pemetaan ke Stage 1
1. Bola 96/112/144 → 64/80/112 + headline shrink (HERO) ✓
2. First frame mobile (picture/srcset → /hero/mobile/0001.webp) (HERO) ✓
3. "Breathe." kepotong + CTA ketutup sticky WA bar (HERO: pb mobile ditambah) ✓
4. Bola nutupin konten saat scroll mobile (mitigasi: bola dikecilin + start 24vh; timeline
   GSAP JANGAN diubah — itu perilaku orbit) ✓ (residual dicatat di verifikasi)
5. Manifesto ID masih Inggris → terjemahkan facts[0].body (HERO/messages) ✓
6. Payload 5,5 MB / 3,1 MB — DITUNDA sampai setelah switchover (BUKAN Stage 1)
7. Hapus koordinat dari hero meta pill → HAPUS SELURUH meta bar atas (HERO) ✓
8. Bola start mobile terlalu tinggi 16vh → ~24vh (HERO) ✓
9. Scale-down display-type ~25–30% (SECTIONS + BOOKING H2 + HERO headline) ✓
10. Hero autoplay frame sequence pelan saat load, lalu serahkan ke scroll scrub (HERO;
    hanya jika scrollY≈0 + tanpa reduced-motion; kill saat user pertama kali scroll;
    kalau verifikasi menunjukkan tarik-menarik dengan scrub → DROP, catat) ✓
11. Bola kecil, duduk di raket model (bukan di meta pill) — meta pill sudah dihapus;
    posisi start 24vh dicek visual di verifikasi (HERO) ✓
12. Sun glare / lens flare di hero — overlay CSS radial-gradient halus,
    pointer-events-none (HERO) ✓
13. Hero teks esensial saja: headline + eyebrow + tombol Chat WhatsApp; HAPUS secondary
    CTA "atau chat WhatsApp →" + subcopy (HERO) ✓; koordinat preloader diganti jam
    "08:00–21:30 · Buka Setiap Hari" / "08:00–21:30 · Open Every Day" (HERO/messages) ✓
