/**
 * StickyWhatsAppBar — mobile-only (≤768px) sticky bottom WhatsApp CTA.
 *
 * Fixed to the viewport bottom with iOS safe-area padding. The layout adds
 * mobile bottom padding to <main> so this bar never hides footer content.
 */
import type { SiteMessages } from "@/lib/content";

export default function StickyWhatsAppBar({
  bar,
}: {
  bar: SiteMessages["stickyBar"];
}) {
  return (
    <a
      href={bar.url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 bg-lime px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] text-sm font-semibold text-jungle shadow-[0_-4px_20px_rgba(14,31,26,0.15)] md:hidden"
    >
      <span aria-hidden="true">💬</span>
      {bar.label}
    </a>
  );
}
