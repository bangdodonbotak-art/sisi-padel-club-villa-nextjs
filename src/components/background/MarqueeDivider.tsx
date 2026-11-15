/**
 * MarqueeDivider — the "STAY • PLAY • BREATHE •" band.
 *
 * A kinetic divider the next worker places between sections (architecture
 * §5: it also closes the dark dead band above the footer). The text runs
 * twice for a seamless CSS loop; the second copy is aria-hidden.
 * Only Sisi colours; 0 KB new assets.
 */
export default function MarqueeDivider({
  text = "STAY • PLAY • BREATHE •",
  className = "",
}: {
  text?: string;
  className?: string;
}) {
  const items = Array.from({ length: 6 }, (_, i) => i);
  const row = (hidden: boolean) => (
    <div
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center"
    >
      {items.map((i) => (
        <span
          key={i}
          className="font-display px-6 text-2xl font-bold tracking-wide whitespace-nowrap text-cream uppercase sm:text-3xl"
        >
          {text}
        </span>
      ))}
    </div>
  );

  return (
    <div
      aria-label="Stay. Play. Breathe."
      className={`overflow-hidden border-y border-lime/25 bg-jungle py-4 ${className}`}
    >
      <div className="animate-marquee flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
