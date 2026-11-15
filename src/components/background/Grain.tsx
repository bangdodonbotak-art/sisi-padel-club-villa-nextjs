/**
 * Grain — SVG-noise overlay, ~4% opacity, site-wide.
 *
 * Pure CSS/SVG (data-URI feTurbulence), 0 KB of new assets. Rendered
 * inside the fixed background stack in the locale layout, behind content.
 * pointer-events: none; purely decorative.
 */
export default function Grain() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "160px 160px",
      }}
    />
  );
}
