# Content Spec — Sisi Padel Club & Villa Bali (Next.js rebuild)

> **Source:** `~/workspace/sisi-padel-club-villa/index.html` — 1,465 lines, static HTML (live site clone).
> Read in full on 2026-11-15. This document is the single source of truth for copy and assets in the rebuild.
> All Indonesian copy below is **verbatim** from the source (`&amp;` rendered as `&`, `&ndash;` as `–`, `&starf;` as `★`). Do not paraphrase it.
> **No prices may be invented anywhere.** The old site shows no prices; the new build must not add any.

---

## 0. FREEZE NOTICE — Hero & Ball (instruksi Dony, wajib)

**Hero dan bola TIDAK BOLEH DIUBAH — port 1:1 persis seperti website live.**

- **Hero = frame-sequence orbit yang sama:** 64 frame desktop (`hero/desktop/0001.webp`–`0064.webp`) + 48 frame mobile (`hero/mobile/0001.webp`–`0048.webp`), pin + scrub sama (ScrollTrigger `start: 'top top'`, `end: '+=400%'`, `scrub: 0.5`), preloader sama (counter 00–100 dari frame yang ter-decode, safety timeout 3 detik), headline sama (`STAY. PLAY. / Breathe.`), metadata line, subcopy, dan CTA sama (kecuali CTA Playtomic yang diganti per §6 — itu perubahan booking, bukan perubahan hero).
- **Bola = file `padel-ball.png` yang sama (657.492 B)**, posisi dan perilaku melayang sama (fixed layer, start `top 16vh / right 6vw` mobile, `18vh / 14vw` desktop; timeline scrub 0.8: rotasi 340° → 720° → 1080°, scale 0.72 → 0.48 → 0.34, opacity akhir 0.85; fallback SVG prosedural tetap dipertahankan bila PNG gagal load).
- **Jangan rekomendasikan perubahan pada hero atau bola di manapun dalam build ini.** Bagian lain dari spec ini tidak mengubah hero/bola.

---

## 1. Global copy (head, nav, preloader)

### 1.1 `<head>` metadata

| Field | Verbatim value |
|---|---|
| `<title>` | `Sisi Padel Club & Villa Bali — Stay. Play. Breathe.` |
| `<meta name="description">` | `Sisi Padel Club & Villa Bali. 2 roofed outdoor panoramic courts (Upper Court & Main Court) dengan red turf & glass walls di Pejeng Kelod, Tampaksiring, Gianyar, Bali.` |
| `<html lang>` | `id` |

### 1.2 Sticky nav

- Wordmark: `SISI PADEL BALI` (with lime dot)
- Links (in order): `Manifesto` → `#manifesto` · `Courts` → `#courts` · `Vibe` → `#vibe` · `Stay` → `#stay` · `Sessions` → `#plans` · `FAQ` → `#faq` · `Visit` → `#visit`
- Nav CTA button (old): `Playtomic` → `https://playtomic.com/clubs/sisi-padel-club` — **see §6, occurrence #1–2: becomes a WhatsApp CTA.**

### 1.3 Preloader (verbatim)

- Top-left: `Sisi Padel Club & Villa Bali`
- Top-right: `Pejeng Kelod · Gianyar`
- Counter: `00` + `%` (counts 00 → 100 as hero frames decode; never blocks longer than 3 s)
- Under counter: `Stay. Play. Breathe.`
- Bottom-left: `-8.49769243, 115.30430716`
- Bottom-right: `Red Turf · Panoramic Glass`

---

## 2. Section-by-section verbatim copy

### 2.1 Hero (`#hero`)

- Top meta bar, left pill: `Pejeng Kelod, Tampaksiring`
- Top meta bar, left (desktop only): `Gianyar Regency, Bali 80552`
- Top meta bar, right (mono): `-8.49769243, 115.30430716`
- Eyebrow: `Sisi Padel Club & Villa Bali`
- Headline (two lines):
  - Line 1: `STAY. PLAY.`
  - Line 2 (italic, lime): `Breathe.`
- Primary CTA (old): `Book di Playtomic` — **see §6, occurrence #3–4: becomes `Chat WhatsApp`.**
- Secondary CTA: `atau chat WhatsApp →` → `#booking`
- Subcopy: `2 roofed outdoor panoramic courts (Upper Court & Main Court) dengan red turf, glass walls, dan villa di lokasi di Tampaksiring, Gianyar.`

### 2.2 Club strip (`#club-strip`)

Three stats, in order:

| Big text | Small label |
|---|---|
| `2 COURTS` | `Upper & Main` |
| `08:00–21:30` | `Buka Setiap Hari` |
| `5★ / 26` | `Google Reviews` |

### 2.3 Manifesto (`#manifesto`)

- Section label: `01 / Manifesto`
- Section label, right: `Pejeng Kelod · Tampaksiring · Gianyar Regency`
- **Full manifesto text (verbatim):**

> Di Pejeng Kelod, Tampaksiring, Gianyar, Sisi Padel Club & Villa Bali mempertemukan dua roofed outdoor panoramic courts berlapis red turf dan glass walls dengan ketenangan villa di lokasi. Buka setiap hari pukul 08:00 hingga 21:30 untuk bermain, menginap, dan bernapas lega.

- Fact pill 1 — label: `Permukaan & Konstruksi` · title: `Red Turf & Glass Walls` · body: `2 roofed outdoor panoramic courts: Upper Court & Main Court.`
- Fact pill 2 — label: `Akomodasi` · title: `Villa On Site` · body: `Tersedia villa di area Sisi Padel Club & Villa Bali.`
- Fact pill 3 — label: `Reputasi Komunitas` · title: `5 Stars · 26 Ulasan` · body: `Rating Google terverifikasi untuk Sisi Padel Club & Villa Bali.`

### 2.4 Courts (`#courts`)

- Section label: `02 / The Courts & Amenities`
- Heading: `PANORAMIC RED TURF`
- Intro copy: `Dua lapangan padel outdoor beratap (roofed outdoor panoramic courts) dengan permukaan red turf dan dinding kaca panoramik.`

#### Upper Court card (Court 01)

- Badge: `Court 01`
- Tag: `Roofed Outdoor Panoramic`
- Title: `UPPER COURT`
- Body: `Lapangan padel panoramik beratap dengan permukaan red turf dan glass walls. Tersedia untuk sesi 120 menit setiap hari pukul 08:00–21:30.`
- Footer label: `Red Turf · Glass Walls`
- Footer link (old): `Cek Slot di Playtomic →` — **see §6, occurrence #5–6: becomes WhatsApp wording.**

#### Main Court card (Court 02)

- Badge: `Court 02`
- Tag: `Roofed Outdoor Panoramic`
- Title: `MAIN COURT`
- Body: `Lapangan utama outdoor beratap dengan konstruksi dinding kaca panoramik dan karpet red turf. Buka setiap hari pukul 08:00–21:30.`
- Footer label: `Red Turf · Glass Walls`
- Footer link (old): `Cek Slot di Playtomic →` — **see §6, occurrence #7–8: becomes WhatsApp wording.**

#### 7 fasilitas klub terverifikasi

- Heading: `7 FASILITAS KLUB TERVERIFIKASI`
- Heading, right: `Sisi Padel Club & Villa Bali`
- Numbered list (verbatim, in order):
  1. `Equipment Rental`
  2. `Free Parking`
  3. `Private Parking`
  4. `Store`
  5. `Snack Bar`
  6. `Vending Machine`
  7. `Changing Room`

### 2.5 Vibe (`#vibe`)

- Section label: `03 / Club & Villa Atmosphere`
- Heading: `THE SISI VIBE`
- Swipe indicator: `SWIPE ↔`
- Prev button aria-label: `Geser ke kiri` (glyph: `←`)
- Next button aria-label: `Geser ke kanan` (glyph: `→`)

All 8 slides — top-left label, top-right badge, bottom caption (all verbatim):

| # | Top-left | Top-right badge | Bottom caption |
|---|---|---|---|
| 1 | `01 / Upper Court` | `Sisi Padel Club` | `Sisi Padel Club & Villa Bali — Upper Court` |
| 2 | `02 / Main Court` | `Sisi Padel Club` | `Sisi Padel Club & Villa Bali — Main Court` |
| 3 | `03 / Villa On Site` | `Sisi Padel Club` | `Villa di lokasi Sisi Padel Club & Villa Bali` |
| 4 | `04 / Club Community` | `Sisi Padel Club` | `Komunitas padel di Sisi — Pejeng Kelod, Tampaksiring` |
| 5 | `05 / Ready to Play` | `Sisi Padel Club` | `Siap main — Sisi Padel Club` |
| 6 | `06 / Doubles` | `Sisi Padel Club` | `Main berpasangan di Main Court` |
| 7 | `07 / Welcome` | `Sisi Padel Club` | `Pintu masuk Sisi Padel Club & Villa` |
| 8 | `08 / In Action` | `Video · 21 detik` | `Aksi padel di Sisi Padel Club` |

#### Vibe marquee (kinetic strip, verbatim sequence — repeated twice for the seamless loop)

`SISI PADEL CLUB & VILLA Bali` ● `2 ROOFED OUTDOOR PANORAMIC COURTS` ● `UPPER COURT & MAIN COURT` ● `RED TURF & GLASS WALLS` ● `08:00–21:30 DAILY` ● `PEJENG KELOD, TAMPAKSIRING, GIANYAR` ● (repeat once more, same order; second repeat spells `SISI PADEL CLUB & VILLA BALI` in full caps)

### 2.6 Stay (`#stay`)

- Section label: `04 / Stay On Site`
- Heading: `STAY AT SISI`
- Intro copy: `Main dulu, nginep di lokasi. Villa Sisi ada di dalam area klub — kolam privat, dapur, dan taman di sekelilingnya.`
- Video caption (under villa reel): `Villa Sisi Ubud — video dari @sisipadelclub`

#### Airbnb card — KEEP SEPARATE, never merged with Tiket.com

- Source label: `Airbnb — Sisi's Ubud Villa`
- Body (verbatim): `2 bedrooms · private pool · kitchen · parking · AC · WiFi. Host: RM Arvino.`

#### Tiket.com card — KEEP SEPARATE, never merged with Airbnb

- Source label: `Tiket.com — 1 Bedroom Villa with Pool View`
- Body (verbatim): `70 m² · check-in 14:00 · check-out 12:00 · no breakfast.`

#### Stay CTA

- `Tanya ketersediaan villa di WhatsApp →`
- Link: `https://wa.me/628111592462?text=Halo%20Sisi%20Padel%20Club%2C%20saya%20mau%20tanya%20ketersediaan%20villa.`

### 2.7 Sessions / Plans (`#plans`)

- Section label: `05 / Court Sessions`
- Heading: `120-MINUTE SESSIONS`
- Intro note (old, Playtomic — **see §6, occurrence #13**): `Seluruh ketersediaan slot waktu nyata dan harga resmi dikelola langsung melalui aplikasi & halaman Playtomic Sisi Padel Club.`

#### Card 1 — Upper Court session

- Top-left: `Upper Court` · top-right: `08:00 – 21:30`
- Title: `SESI 120 MENIT — UPPER COURT`
- Bullets:
  - `Durasi bermain standar 120 menit`
  - `Roofed outdoor panoramic court (Red Turf & Glass Walls)`
  - `Tersedia penyewaan alat (Equipment Rental) di lokasi`
- Button (old): `Lihat harga & slot live di Playtomic` — **see §6, occurrence #14–15: becomes WhatsApp wording.**

#### Card 2 — Main Court session

- Top-left: `Main Court` · top-right: `08:00 – 21:30`
- Title: `SESI 120 MENIT — MAIN COURT`
- Bullets:
  - `Durasi bermain standar 120 menit`
  - `Roofed outdoor panoramic court (Red Turf & Glass Walls)`
  - `Akses Changing Room, Store, Snack Bar & Parkir`
- Button (old): `Lihat harga & slot live di Playtomic` — **see §6, occurrence #16–17: becomes WhatsApp wording.**

#### Card 3 — Villa on site (strictly no nightly price)

- Top-left: `Stay & Play` · top-right: `Pejeng Kelod, Bali`
- Title: `VILLA ON SITE`
- Body: `Sisi Padel Club & Villa Bali memiliki fasilitas villa langsung di area klub di Pejeng Kelod, Tampaksiring, Gianyar Regency. Hubungi tim kami via WhatsApp untuk menanyakan ketersediaan menginap.`
- Button: `Tanya Ketersediaan Villa via WhatsApp` → `#booking`

### 2.8 FAQ (`#faq`)

- Section label: `06 / Informasi Terverifikasi`
- Heading: `FREQUENTLY ASKED QUESTIONS`

#### The 4 tabs (verbatim, in order)

1. `1. Lapangan` (`data-tab="courts"`, default active)
2. `2. Booking & Sesi` (`data-tab="booking"`)
3. `3. Fasilitas` (`data-tab="amenities"`)
4. `4. Lokasi & Villa` (`data-tab="location"`)

#### All 7 Q&As (verbatim)

**Tab 1 — Lapangan**

- Q1: `Berapa jumlah dan jenis lapangan di Sisi Padel Club & Villa Bali?`
  - A1: `Terdapat 2 roofed outdoor panoramic courts, yaitu Upper Court dan Main Court, masing-masing menggunakan permukaan red turf dan glass walls.`
- Q2: `Jam berapa lapangan beroperasi setiap harinya?`
  - A2: `Sisi Padel Club & Villa Bali buka setiap hari mulai pukul 08:00 hingga 21:30.`

**Tab 2 — Booking & Sesi**

- Q3: `Bagaimana cara melihat harga dan memesan sesi 120 menit?`
  - A3 (old, Playtomic — **see §6, occurrence #18–20**): `Harga dan ketersediaan slot live dapat dilihat serta dipesan langsung melalui halaman resmi Playtomic di playtomic.com/clubs/sisi-padel-club atau dengan menghubungi WhatsApp 08111592462.`
  - New wording must keep the WhatsApp part and drop/replace the Playtomic part (see §6).
- Q4: `Bagaimana rating Sisi Padel Club & Villa Bali di Google?`
  - A4: `Klub ini memiliki rating 5 bintang dari 26 ulasan di Google.`

**Tab 3 — Fasilitas**

- Q5: `Apa saja fasilitas yang tersedia di lokasi klub?`
  - A5: `Terdapat 7 fasilitas klub: Equipment Rental, Free Parking, Private Parking, Store, Snack Bar, Vending Machine, dan Changing Room.`

**Tab 4 — Lokasi & Villa**

- Q6: `Di mana alamat lengkap dan koordinat Sisi Padel Club & Villa Bali?`
  - A6: `Berlokasi di Pejeng Kelod, Tampaksiring, Gianyar Regency, Bali 80552 pada koordinat -8.49769243, 115.30430716.`
- Q7: `Apakah tersedia villa di lokasi klub?`
  - A7: `Ya, tersedia villa di lokasi (villa on site) di Sisi Padel Club & Villa Bali. Silakan hubungi WhatsApp 08111592462 untuk informasi ketersediaan menginap.`

### 2.9 Booking (`#booking`)

- Section label: `07 / Reserve Your Court`
- Heading: `BOOK YOUR SESSION`
- Intro (old, Playtomic — **see §6, occurrence #23**): `Pesan langsung slot real-time di Playtomic atau susun pesan WhatsApp Anda ke nomor resmi klub 08111592462.`

#### Left card — Live Court Booking (old, Playtomic — see §6, occurrence #24–26)

- Label: `Live Court Booking`
- Title: `PLAYTOMIC OFFICIAL CLUB PAGE`
- Button (old): `Lihat harga & slot live di Playtomic ↗` → `https://playtomic.com/clubs/sisi-padel-club`
- **New build: this whole card is removed and replaced by a WhatsApp-first card** (see §6). Do not keep the Playtomic title, link, or button.

#### Right card — WhatsApp Composer form (`#wa-composer-form`)

- Label: `WhatsApp Composer`
- Title: `KIRIM PESAN KE 08111592462`
- Hours pill: `08:00–21:30`
- Submit button: `Buka WhatsApp (08111592462) →`

Form fields (label / id / type / placeholder / options — verbatim):

| Label | Field | Type / options | Placeholder |
|---|---|---|---|
| `Nama Anda` | `wa-name` | text | `Nama lengkap` |
| `Pilihan Lapangan / Villa` | `wa-court` | select | — (no placeholder; options below) |
| `Tanggal` | `wa-date` | date | — (native date picker, no placeholder) |
| `Jam Preferensi (08:00–21:30)` | `wa-time` | text | `Contoh: 09:00 - 11:00` |
| `Catatan Tambahan` | `wa-notes` | textarea, 2 rows | `Tulis pertanyaan seputar slot lapangan, sewa raket, atau villa...` |

`wa-court` select options (verbatim, in order, first = default):

1. `Upper Court (Sesi 120 Menit)`
2. `Main Court (Sesi 120 Menit)`
3. `Upper / Main Court + Equipment Rental`
4. `Informasi Villa On Site`

Helper/default behaviour (from the form JS — preserve in the rebuild):

- Empty name defaults to `Tamu`; empty date defaults to `Fleksibel`; empty time defaults to `Fleksibel (08:00-21:30)`.
- The composed WhatsApp message template (verbatim, `*name*` in asterisks for bold):

```
Halo Sisi Padel Club & Villa Bali,
Saya *{nama}* ingin menanyakan ketersediaan:
• Pilihan: {court}
• Tanggal: {date}
• Jam: {time}
• Catatan: {notes}        ← only if notes were filled in
```

- Opens `https://wa.me/628111592462?text={encoded message}` in a new tab. There is **no success screen / success text** in the old site — the form just opens WhatsApp. Do not invent one.

### 2.10 Visit (`#visit`)

- Section label: `08 / Location & Verified Contacts`
- Heading: `VISIT SISI PADEL BALI`
- Coordinates pill: `Coords: -8.49769243, 115.30430716`

#### Address & hours card

- Label: `Alamat Lengkap`
- Title: `SISI PADEL CLUB & VILLA BALI`
- Address (verbatim, line break after the comma): `Pejeng Kelod, Tampaksiring,` / `Gianyar Regency, Bali 80552`
- Coordinates line: `Latitude: -8.49769243 · Longitude: 115.30430716`
- Hours label: `Jam Operasional` · value: `08:00 – 21:30` · sub: `Buka Setiap Hari`
- Rating label: `Rating Google` · value: `5 Stars / 26` · sub: `Ulasan Terverifikasi`
- Button: `Buka Koordinat di Google Maps ↗` → `https://www.google.com/maps/search/?api=1&query=-8.49769243,115.30430716`

#### Phone card 1 — WhatsApp (source label: WhatsApp)

- Source label (verbatim, shown on the card): `Source Label: WhatsApp`
- Title: `WHATSAPP RESMI`
- Number (display): `08111592462`
- Body: `Nomor kontak khusus pemesanan via WhatsApp & informasi Sisi Padel Club & Villa Bali.`
- Button: `Chat WhatsApp 08111592462` → `https://wa.me/628111592462`
- ⚠️ Old HTML comment above this card reads `Phone 1: WhatsApp (Playtomic / Official Booking)` — **see §6, occurrence #27** (comment only; the visible label is just `WhatsApp`).

#### Phone card 2 — Google (source label: Google)

- Source label (verbatim, shown on the card): `Source Label: Google`
- Title: `KONTAK GOOGLE`
- Number (display): `+62 821-2544-6099`
- Body: `Nomor telepon yang tercantum secara terpisah pada profil bisnis Google Sisi Padel Club & Villa Bali.`
- Button: `Panggil +62 821-2544-6099` → `tel:+6282125446099`
- The two phone numbers must stay **separate cards with their source labels** — never merged into one contact line.

### 2.11 Footer

- Giant wordmark: `SISI PADEL BALI`
- Bottom-left line: `Sisi Padel Club & Villa Bali · Pejeng Kelod, Tampaksiring, Gianyar Regency, Bali 80552`
- Bottom-right links (in order):
  - `Playtomic` → `https://playtomic.com/clubs/sisi-padel-club` — **see §6, occurrence #28–29: remove; replace with a WhatsApp link if a third link is still wanted.**
  - `WhatsApp: 08111592462` → `https://wa.me/628111592462`
  - `Google: +62 821-2544-6099` → `tel:+6282125446099`

#### Footer marquee (verbatim sequence — repeated twice for the seamless loop)

`STAY. PLAY. BREATHE.` ● `SISI PADEL CLUB & VILLA BALI` ● `PEJENG KELOD, TAMPAKSIRING, GIANYAR REGENCY, BALI 80552` ● `WHATSAPP 08111592462` ● `GOOGLE +62 821-2544-6099` ● (repeat once more, same order)

---

## 3. Asset mapping (per section)

Source root for all paths below: `~/workspace/sisi-padel-club-villa/`.
New-build paths are up to the builder; filenames below are the source filenames to carry over.

### 3.1 Hero (`#hero`) — FROZEN, port 1:1 (§0)

| Asset | Path | Use / notes | Alt text |
|---|---|---|---|
| Frame 1 (LCP `<img>`) | `hero/desktop/0001.webp` | First frame, `fetchpriority="high"`; JS swaps it to the mobile set's frame 1 on ≤768 px | `Sisi Padel Club — pemain padel di lapangan merah saat golden hour` |
| Frames 2–64 | `hero/desktop/0002.webp` – `0064.webp` | Canvas frame sequence, desktop (>768 px); 64 frames total | — (canvas, no alt) |
| Frames 1–48 | `hero/mobile/0001.webp` – `0048.webp` | Canvas frame sequence, mobile (≤768 px); 48 frames total | — (canvas, no alt) |

Sequence behaviour (preserve exactly): frame 0 loads first, then batches of 8 with 6 concurrent loaders; scroll scrub picks frame `round(progress × (count − 1))`; nearest loaded frame at-or-below is drawn as fallback, never backwards; preloader % = decoded / total frames.

### 3.2 Floating ball (site-wide layer) — FROZEN, port 1:1 (§0)

| Asset | Path | Use / notes | Alt text |
|---|---|---|---|
| Padel ball | `padel-ball.png` (657.492 B, transparent RGBA PNG) | Fixed layer `#floating-ball-layer`, travels down the page on scroll (see §0 for exact motion) | `Padel Ball` |

Fallback if the PNG fails to load: procedural inline SVG (lime radial-gradient ball with two white seam curves) — keep it.

### 3.3 Courts (`#courts`)

| Asset | Path | Use | Alt text |
|---|---|---|---|
| Upper Court photo | `assets/photos/padel-A4.jpg` | Upper Court card, 16/10, `object-[center_30%]` | `Upper Court — pemain padel di lapangan merah Sisi` |
| Main Court photo | `assets/photos/padel-A7.jpg` | Main Court card, 16/10, `object-[center_30%]` | `Main Court — servis di lapangan merah Sisi` |

### 3.4 Vibe (`#vibe`) — 8 slides

| Slide | Asset | Path | Alt text / aria-label |
|---|---|---|---|
| 1 — Upper Court | `assets/photos/padel-hero-A1.jpg` | `assets/photos/padel-hero-A1.jpg` | `Upper Court — forehand di depan net post Sisi Padel` |
| 2 — Main Court | `assets/photos/padel-A5.jpg` | `assets/photos/padel-A5.jpg` | `Main Court — forehand di depan dinding bambu` |
| 3 — Villa On Site | `assets/photos/sisi-villa-portrait.jpg` | `assets/photos/sisi-villa-portrait.jpg` | `Villa Sisi — kolam dan gazebo` |
| 4 — Club Community | `assets/photos/padel-C1-grup.jpg` | `assets/photos/padel-C1-grup.jpg` | `Komunitas padel Sisi berfoto bersama` |
| 5 — Ready to Play | `assets/photos/padel-B1.jpg` | `assets/photos/padel-B1.jpg` | `Pemain wanita siap main di net Sisi Padel` |
| 6 — Doubles | `assets/photos/padel-C2-netpost.jpg` | `assets/photos/padel-C2-netpost.jpg` | `Dua pemain di net Main Court` |
| 7 — Welcome | `assets/photos/entrance.jpg` | `assets/photos/entrance.jpg` | `Pintu masuk Sisi Padel Club dan Villa` |
| 8 — In Action (video) | `assets/videos/padel-21s.mp4` | `assets/videos/padel-21s.mp4` | `aria-label="Aksi padel 21 detik di Sisi Padel Club"` (autoplay, muted, loop, playsinline, `preload="metadata"`) |

### 3.5 Stay (`#stay`)

| Asset | Path | Use | Alt text / aria-label |
|---|---|---|---|
| Villa reel (video) | `assets/videos/villa-reel-DLpdFaCJz3HW-13s.mp4` | Left column, 9/16, max-h 640 px (autoplay, muted, loop, playsinline, `preload="metadata"`) | `aria-label="Video villa Sisi Ubud"` — note: the aria-label says "Sisi Ubud" while the caption says "Villa Sisi Ubud"; keep the caption as-is, and fix the aria-label to `Video villa Sisi` in the new build (label-only fix, not a copy change) |
| Pool + gazebo photo | `assets/photos/sisi-hero.jpg` | Photo grid, 4/3 | `Kolam villa Sisi dengan gazebo dan sawah` |
| Facade + pool photo | `assets/photos/sisi-airbnb-pool-facade.jpg` | Photo grid, 4/3 | `Fasad villa dengan kolam` |
| Garden + pool photo | `assets/photos/sisi-airbnb-pool-garden.jpg` | Photo grid, 4/3, spans 2 columns | `Taman dan kolam villa Sisi` |

### 3.6 Sections with no photo/video assets

- **Club strip, Manifesto, Plans/Sessions, FAQ, Booking, Visit, Footer:** typography only, no images or video. (Booking/Visit/Footer use text links only.)

### 3.7 Unreferenced asset in the source folder (do NOT silently include)

- `hero-orbit.mp4` (6.739.634 B) sits at the source root but is **never referenced anywhere in `index.html`** (no `<video>`, `<source>`, or JS reference). Do not add it to the new build unless Dony explicitly asks for it.

### 3.8 Asset inventory (for the copy-over checklist)

- `hero/desktop/`: 64 WebP frames (`0001.webp`–`0064.webp`), ~40–72 KB each
- `hero/mobile/`: 48 WebP frames (`0001.webp`–`0048.webp`), ~30–45 KB each
- `assets/photos/`: 12 JPGs — `entrance.jpg`, `padel-A4.jpg`, `padel-A5.jpg`, `padel-A7.jpg`, `padel-B1.jpg`, `padel-C1-grup.jpg`, `padel-C2-netpost.jpg`, `padel-hero-A1.jpg`, `sisi-airbnb-pool-facade.jpg`, `sisi-airbnb-pool-garden.jpg`, `sisi-hero.jpg`, `sisi-villa-portrait.jpg`
- `assets/videos/`: `padel-21s.mp4` (~3,0 MB), `villa-reel-DLpdFaCJz3HW-13s.mp4` (~2,5 MB)
- Root: `padel-ball.png` (657.492 B)

---

## 4. Facts table (verified from the source — do not invent beyond this)

| Fact | Value | Where it appears |
|---|---|---|
| Business name | `Sisi Padel Club & Villa Bali` | Title, nav, hero, footer |
| Short name / wordmark | `SISI PADEL BALI` | Nav, footer |
| Full address | `Pejeng Kelod, Tampaksiring, Gianyar Regency, Bali 80552` | Hero meta bar, manifesto label, visit card, footer |
| Coordinates | `-8.49769243, 115.30430716` (lat `-8.49769243`, lng `115.30430716`) | Preloader, hero meta bar, visit card, FAQ A6 |
| Google Maps link | `https://www.google.com/maps/search/?api=1&query=-8.49769243,115.30430716` | Visit card |
| Opening hours | `08:00–21:30`, `Buka Setiap Hari` | Club strip, both court cards, both session cards, booking pill, visit card, FAQ A2, marquees |
| Google rating | `5 Stars / 26` ulasan (`5★ / 26` in the strip) | Club strip, manifesto pill 3, visit card, FAQ A4 |
| Phone 1 — WhatsApp (official booking) | Display `08111592462` · link `https://wa.me/628111592462` · source label `WhatsApp` | Booking form, stay CTA, FAQ A3/A7, visit card 1, footer marquee + footer links |
| Phone 2 — Google listing | Display `+62 821-2544-6099` · link `tel:+6282125446099` · source label `Google` | Visit card 2, footer marquee + footer links |
| Courts | 2 — `Upper Court` (Court 01) + `Main Court` (Court 02) | Hero subcopy, club strip, courts section, FAQ A1 |
| Court type | `Roofed outdoor panoramic courts`, `red turf`, `glass walls` | Throughout |
| Session duration | `120 menit` (standard session) | Court cards, plans section, FAQ Q3 |
| Facilities (7) | Equipment Rental, Free Parking, Private Parking, Store, Snack Bar, Vending Machine, Changing Room | Courts section, FAQ A5, session card 2 |
| Villa — Airbnb facts | `2 bedrooms · private pool · kitchen · parking · AC · WiFi. Host: RM Arvino.` | Stay section (§2.6 — keep separate) |
| Villa — Tiket.com facts | `70 m² · check-in 14:00 · check-out 12:00 · no breakfast.` | Stay section (§2.6 — keep separate) |
| Villa — general | On site, in the club area; private pool, kitchen, garden; availability only via WhatsApp 08111592462 | Stay intro, plans card 3, FAQ A7 |
| Villa video credit | `Villa Sisi Ubud — video dari @sisipadelclub` | Stay section |
| Vibe video | Padel action, 21 seconds (`padel-21s.mp4`) | Vibe slide 8 |
| Villa video | 13 seconds (`villa-reel-DLpdFaCJz3HW-13s.mp4`) | Stay section |
| Prices | **None stated anywhere in the source.** No court price, no villa nightly price. Do not invent any. | — |

---

## 5. Other copy worth preserving verbatim

- **Nav CTA** (old): `Playtomic` — see §6.
- **Vibe controls:** `SWIPE ↔`, `Geser ke kiri`, `Geser ke kanan` (§2.5).
- **WhatsApp message template + field defaults:** §2.9 — the exact template, the `Tamu` / `Fleksibel` / `Fleksibel (08:00-21:30)` defaults, and the `wa.me/628111592462` target.
- **Preloader copy:** §1.3.
- **Marquees:** vibe marquee (§2.5) and footer marquee (§2.11) — both repeat their sequence twice for the loop.
- **Section numbers/labels:** `01 / Manifesto`, `02 / The Courts & Amenities`, `03 / Club & Villa Atmosphere`, `04 / Stay On Site`, `05 / Court Sessions`, `06 / Informasi Terverifikasi`, `07 / Reserve Your Court`, `08 / Location & Verified Contacts`.
- **HTML comments that carry meaning for the builder** (not user-visible, but record the old intent):
  - `<!-- Left Column: Direct Playtomic Deep-link & Club Hours -->` (booking)
  - `<!-- Phone 1: WhatsApp (Playtomic / Official Booking) -->` (visit)
  - `<!-- Right Column: Interactive WhatsApp Message Composer to 08111592462 -->` (booking)
  - `<!-- Villa film (Dony's pick: reel DLpdFaCJz3HW) -->` (stay)
  - `<!-- 3 villa photos + facts (Airbnb vs Tiket kept separate, no price) -->` (stay)
- **No form success text exists** in the old site — the composer just opens WhatsApp. Do not invent a success message.
- **Fonts (for the record, not copy):** Fira Sans Extra Condensed (600, 600i, 700) for display; Inter Tight (400, 500, 600) for body. Brand colours: court-red `#C1272D`, sand `#F3EFE6`, jungle `#0E1F1A`, lime `#D9FF3F`.

---

## 6. Playtomic removal map

### 6.1 Count discrepancy — read this first

The brief said the word "playtomic" appears **21 times** (case-insensitive). A machine count over the source file (`grep -o -i playtomic | wc -l`, verified with a Python regex pass) finds **25 occurrences** on **21 lines**. The 21-line figure matches the brief; the 4 extra occurrences are second matches on lines that contain the word twice (lines 289, 869, 1176) plus the three-way match on line 869. **All 25 occurrences are listed below — nothing is skipped.** Breakdown: 9× inside `href="https://playtomic.com/…"` URLs, 13× visible link/button/body text, 3× HTML comments.

### 6.2 Every occurrence (line number + exact text + what it becomes)

| # | Line | Exact text (as in source) | Type | What it becomes in the new build |
|---|---|---|---|---|
| 1 | 246 | `href="https://playtomic.com/clubs/sisi-padel-club"` | Nav CTA link URL | **Remove.** Nav CTA becomes a WhatsApp link: `https://wa.me/628111592462` (label TBD by builder — e.g. `WhatsApp` or `Book via WhatsApp`; do not keep the word Playtomic). |
| 2 | 251 | `Playtomic` | Nav CTA button label | **Remove.** Replaced by the new WhatsApp CTA label (see #1). |
| 3 | 289 | `href="https://playtomic.com/clubs/sisi-padel-club"` | Hero primary CTA link URL | **Remove.** Hero primary CTA becomes `Chat WhatsApp` linking to `https://wa.me/628111592462`. (Hero visuals/copy otherwise frozen per §0.) |
| 4 | 289 | `Book di Playtomic` | Hero primary CTA label | **Remove.** New label: `Chat WhatsApp`. The secondary CTA `atau chat WhatsApp →` stays as-is. |
| 5 | 393 | `href="https://playtomic.com/clubs/sisi-padel-club"` | Upper Court card link URL | **Remove.** Link becomes `https://wa.me/628111592462` (or `#booking`). |
| 6 | 398 | `Cek Slot di Playtomic →` | Upper Court card link label | **Remove.** New label: `Cek Slot via WhatsApp →` (same link target as #5). |
| 7 | 423 | `href="https://playtomic.com/clubs/sisi-padel-club"` | Main Court card link URL | **Remove.** Link becomes `https://wa.me/628111592462` (or `#booking`). |
| 8 | 428 | `Cek Slot di Playtomic →` | Main Court card link label | **Remove.** New label: `Cek Slot via WhatsApp →` (same link target as #7). |
| 9 | 696 | `Seluruh ketersediaan slot waktu nyata dan harga resmi dikelola langsung melalui aplikasi & halaman Playtomic Sisi Padel Club.` | Plans section intro note | **Reword (no Playtomic, no invented prices):** `Untuk harga dan ketersediaan slot, hubungi WhatsApp 08111592462.` |
| 10 | 728 | `href="https://playtomic.com/clubs/sisi-padel-club"` | Session card 1 (Upper) button URL | **Remove.** Button becomes a WhatsApp link: `https://wa.me/628111592462` (or `#booking`). |
| 11 | 733 | `Lihat harga & slot live di Playtomic` | Session card 1 (Upper) button label | **Remove.** New label: `Tanya harga & slot via WhatsApp`. |
| 12 | 764 | `href="https://playtomic.com/clubs/sisi-padel-club"` | Session card 2 (Main) button URL | **Remove.** Button becomes a WhatsApp link: `https://wa.me/628111592462` (or `#booking`). |
| 13 | 769 | `Lihat harga & slot live di Playtomic` | Session card 2 (Main) button label | **Remove.** New label: `Tanya harga & slot via WhatsApp`. |
| 14 | 869 | `Harga dan ketersediaan slot live dapat dilihat serta dipesan langsung melalui halaman resmi Playtomic di` | FAQ A3 body text (part 1 of 3 on this line) | **Reword:** `Harga dan ketersediaan slot live dapat ditanyakan langsung melalui WhatsApp 08111592462.` |
| 15 | 869 | `href="https://playtomic.com/clubs/sisi-padel-club"` | FAQ A3 link URL | **Remove.** The whole Playtomic link is deleted from the answer (see #14). |
| 16 | 869 | `playtomic.com/clubs/sisi-padel-club` | FAQ A3 link text | **Remove.** Deleted with the link (see #14–15). Note the answer already ends with `atau dengan menghubungi WhatsApp 08111592462` — after the reword, keep a single WhatsApp mention, not two. |
| 17 | 911 | `BOOKING SECTION (Court-Red #C1272D Ground — WhatsApp Composer + Playtomic)` | HTML comment (section header) | **Remove / update comment.** New comment: `BOOKING SECTION (Court-Red #C1272D Ground — WhatsApp Composer)`. Not user-visible. |
| 18 | 917 | `<!-- Left Column: Direct Playtomic Deep-link & Club Hours -->` | HTML comment | **Remove / update comment.** The left column itself is replaced (see #19–21). Not user-visible. |
| 19 | 924 | `Pesan langsung slot real-time di Playtomic atau susun pesan WhatsApp Anda ke nomor resmi klub 08111592462.` | Booking intro copy | **Reword:** `Susun pesan WhatsApp Anda ke nomor resmi klub 08111592462.` |
| 20 | 929 | `PLAYTOMIC OFFICIAL CLUB PAGE` | Booking left-card title | **Remove.** The whole left card is replaced by a WhatsApp-first card (e.g. title `BOOKING VIA WHATSAPP`, body pointing to 08111592462). |
| 21 | 931 | `href="https://playtomic.com/clubs/sisi-padel-club"` | Booking left-card button URL | **Remove.** Replaced by `https://wa.me/628111592462` in the new WhatsApp-first card. |
| 22 | 936 | `Lihat harga & slot live di Playtomic ↗` | Booking left-card button label | **Remove.** New label: `Chat WhatsApp 08111592462 ↗` (or `Buka WhatsApp ↗`). |
| 23 | 1078 | `<!-- Phone 1: WhatsApp (Playtomic / Official Booking) -->` | HTML comment above visit phone card 1 | **Remove / update comment.** The visible card is already WhatsApp-only (`Source Label: WhatsApp`); new comment: `<!-- Phone 1: WhatsApp (Official Booking) -->`. Not user-visible. |
| 24 | 1176 | `href="https://playtomic.com/clubs/sisi-padel-club"` | Footer link URL | **Remove.** Delete the footer Playtomic link entirely (footer keeps `WhatsApp: 08111592462` and `Google: +62 821-2544-6099`). |
| 25 | 1176 | `Playtomic` | Footer link label | **Remove.** Deleted with the link (see #24). |

### 6.3 Post-removal checklist

- [ ] Zero occurrences of the string `playtomic` (any case) in the new codebase — code, copy, comments, URLs, and metadata.
- [ ] Zero links to `playtomic.com` anywhere.
- [ ] Every former Playtomic CTA now points to `https://wa.me/628111592462` (or `#booking`, where the composer lives) — never to a dead link.
- [ ] No prices invented to replace the Playtomic price pages — all price/slot questions route to WhatsApp 08111592462.
- [ ] FAQ Q3 reworded once, with a single WhatsApp mention (see #14–16).
- [ ] Hero and ball untouched except the hero primary CTA link/label (#3–4) — visuals, frames, motion, and preloader frozen per §0.

---

## 7. Gaps / things NOT found in the source

- **No prices anywhere** (court sessions or villa nightly rate) — nothing to carry over; do not invent any.
- **No email address, no Instagram/TikTok handle** in the HTML (only `@sisipadelclub` appears inside the villa video caption, §2.6 — that is a video credit, not a linked social handle).
- **No form success text** — the composer just opens WhatsApp (§2.9).
- **No second villa photo set / no room-detail pages** — the stay section is one chapter only (1 video + 3 photos + 2 source cards).
- **No booking-confirmation, cancellation, or refund policy text** in the source.
- **`hero-orbit.mp4` is unreferenced** (§3.7) — excluded from the build unless Dony asks for it.
- **Playtomic count is 25, not 21** (§6.1) — all 25 are mapped above.

---

*End of content spec. Source file untouched; this spec is the only file written.*
