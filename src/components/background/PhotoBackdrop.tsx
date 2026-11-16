/**
 * PhotoBackdrop — full-page dynamic photo background (Dony 12:21).
 *
 * Replaces the old ScrollCrossfade colour layers. Three photos from the
 * site's own public/ folder (hero frame + villa shots, all already on
 * the site — nothing fetched from outside) crossfade slowly with a
 * gentle Ken Burns drift, behind a dark jungle scrim so text on top
 * stays readable. The hero is opaque and covers this layer; from the
 * first section after the hero down to the footer, sections are
 * transparent and this backdrop shows through.
 *
 * Lightweight: plain <img> + CSS opacity/transform animations only
 * (no three.js, no JS driver). fetchpriority="low" + loading="lazy"
 * so it never competes with the hero LCP. Under
 * prefers-reduced-motion the animation stops and only the first
 * photo shows, statically.
 */
const PHOTOS = [
  { src: "/assets/photos/sisi-hero.jpg", alt: "" },
  { src: "/assets/photos/sisi-airbnb-pool-facade.jpg", alt: "" },
  { src: "/hero/desktop/0032.webp", alt: "" },
] as const;

export default function PhotoBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {PHOTOS.map((photo, i) => (
        <div
          key={photo.src}
          className="photo-backdrop-layer absolute inset-0"
          style={{ animationDelay: `${-i * 12}s` }}
        >
          <img
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="photo-backdrop-img h-full w-full object-cover"
          />
        </div>
      ))}
      {/* Dark scrim — text on top of the photos must stay readable. */}
      <div className="absolute inset-0 bg-jungle/65" />
      <div className="absolute inset-0 bg-gradient-to-b from-jungle/70 via-transparent to-jungle/70" />
    </div>
  );
}
