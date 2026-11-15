/**
 * Typed content layer — the single access point for all site copy.
 *
 * Phase 1 (CMS-ready, per architecture.md §1): content lives in-repo as
 * structured local files (content/*.json + messages/*.json). When Sanity
 * goes live (Phase 2), swap the data source inside these functions only —
 * callers keep the same API and return shapes.
 *
 * No prices anywhere in this layer (the source site states none).
 */

import courtsData from "../../content/courts.json";
import faqData from "../../content/faq.json";
import photosData from "../../content/photos.json";
import idMessages from "../../messages/id.json";
import enMessages from "../../messages/en.json";

export type Locale = "id" | "en";

export const locales: Locale[] = ["id", "en"];
export const defaultLocale: Locale = "id";

export function isLocale(value: string): value is Locale {
  return value === "id" || value === "en";
}

/* ------------------------------------------------------------------ */
/* Courts                                                            */
/* ------------------------------------------------------------------ */

export interface Court {
  id: string;
  badge: string;
  tag: string;
  title: string;
  body: string;
  footerLabel: string;
  footerLinkLabel: string;
  photo: string;
  photoAlt: string;
}

export function getCourts(locale: Locale): Court[] {
  return (courtsData as Record<Locale, Court[]>)[locale];
}

/* ------------------------------------------------------------------ */
/* FAQ                                                               */
/* ------------------------------------------------------------------ */

export interface FaqTab {
  id: string;
  label: string;
}

export interface FaqItem {
  id: string;
  tab: string;
  question: string;
  answer: string;
}

export interface FaqContent {
  tabs: FaqTab[];
  items: FaqItem[];
}

export function getFaq(locale: Locale): FaqContent {
  return (faqData as Record<Locale, FaqContent>)[locale];
}

/* ------------------------------------------------------------------ */
/* Photos (Vibe slider + Stay grid + villa reel)                     */
/* ------------------------------------------------------------------ */

export interface VibeSlide {
  id: number;
  kind: "image" | "video";
  src: string;
  label: string;
  badge: string;
  caption: string;
  alt: string;
}

export interface StayPhoto {
  id: string;
  src: string;
  alt: string;
  aspect: string;
  span: 1 | 2;
}

export interface VillaReel {
  src: string;
  caption: string;
  ariaLabel: string;
}

export interface PhotosContent {
  vibe: VibeSlide[];
  stay: StayPhoto[];
  villaReel: VillaReel;
}

export function getPhotos(locale: Locale = "id"): PhotosContent {
  return (photosData as Record<Locale, PhotosContent>)[locale];
}

/* ------------------------------------------------------------------ */
/* Site strings (messages/*.json) — one typed view over next-intl    */
/* messages so server components can read copy without the hook.     */
/* ------------------------------------------------------------------ */

export type SiteMessages = typeof idMessages;

export function getSite(locale: Locale): SiteMessages {
  return locale === "en" ? (enMessages as SiteMessages) : idMessages;
}

/** All messages for next-intl's NextIntlClientProvider. */
export function getMessages(locale: Locale): SiteMessages {
  return getSite(locale);
}

/* ------------------------------------------------------------------ */
/* Shared facts (locale-independent)                                 */
/* ------------------------------------------------------------------ */

export const siteFacts = {
  businessName: "Sisi Padel Club & Villa Bali",
  wordmark: "SISI PADEL BALI",
  address: "Pejeng Kelod, Tampaksiring, Gianyar Regency, Bali 80552",
  latitude: -8.49769243,
  longitude: 115.30430716,
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=-8.49769243,115.30430716",
  hours: "08:00–21:30",
  ratingValue: 5,
  ratingCount: 26,
  whatsappDisplay: "08111592462",
  whatsappUrl: "https://wa.me/628111592462",
  phoneGoogleDisplay: "+62 821-2544-6099",
  phoneGoogleTel: "tel:+6282125446099",
} as const;
