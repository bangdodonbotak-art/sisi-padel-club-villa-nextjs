/**
 * FacilityIcon — inline SVG icons for the 7 club facilities (Dony 12:18).
 *
 * Lucide-style stroke icons (24×24, stroke currentColor, no fill, no
 * emoji, no new dependency). Matched by INDEX (facility order is fixed
 * in the content layer) — not by name, because names differ per locale.
 *
 * 0 Equipment Rental — padel ball with seams
 * 1 Free Parking — P in a rounded square
 * 2 Private Parking — P with a padlock badge
 * 3 Store — shopping bag
 * 4 Snack Bar — takeaway cup with straw
 * 5 Vending Machine — machine with display + buttons
 * 6 Changing Room — clothes hanger
 */
const ICONS: Record<number, React.ReactNode> = {
  0: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.6 8.4c4.2 1.6 8.6 1.6 12.8 0" />
      <path d="M5.6 15.6c4.2-1.6 8.6-1.6 12.8 0" />
    </>
  ),
  1: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9.5 17V7h4.5a3.25 3.25 0 0 1 0 6.5H9.5" />
    </>
  ),
  2: (
    <>
      <path d="M8 16.5v-9h4a3 3 0 0 1 0 6H8" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      <path d="M15.5 13.5v-1.5a2 2 0 0 1 4 0v1.5" />
    </>
  ),
  3: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
  4: (
    <>
      <path d="M6 4h12l-1.2 15.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 4Z" />
      <path d="M14 4l2-2.5" />
      <path d="M7.2 10h9.6" />
    </>
  ),
  5: (
    <>
      <rect x="5" y="2.5" width="14" height="19" rx="2" />
      <rect x="8" y="5.5" width="8" height="6" rx="1" />
      <path d="M8.5 15.5h.01" />
      <path d="M12 15.5h.01" />
      <path d="M15.5 15.5h.01" />
      <path d="M8 18.5h8" />
    </>
  ),
  6: (
    <>
      <path d="M12 7.5V6a2 2 0 1 0-2-2" />
      <path d="M12 7.5 4 20h16L12 7.5Z" />
      <path d="M8.2 15.5h7.6" />
    </>
  ),
};

export default function FacilityIcon({ index }: { index: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
    >
      {ICONS[index] ?? ICONS[0]}
    </svg>
  );
}
