import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { getSite, isLocale, locales, siteFacts } from "@/lib/content";
import { routing } from "@/i18n/routing";
import Grain from "@/components/background/Grain";
import Aurora from "@/components/background/Aurora";
import ScrollCrossfade from "@/components/background/ScrollCrossfade";
import CursorGlow from "@/components/background/CursorGlow";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import StickyWhatsAppBar from "@/components/StickyWhatsAppBar";
import LenisProvider from "@/components/LenisProvider";
import "../globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://sisi-padel-club-villa-nextjs.vercel.app";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "id";
  const site = getSite(loc);
  const canonical = loc === "id" ? siteUrl : `${siteUrl}/en`;
  const ogImage = `${siteUrl}/hero/desktop/0001.webp`;

  return {
    metadataBase: new URL(siteUrl),
    title: site.meta.title,
    description: site.meta.description,
    alternates: {
      canonical,
      languages: {
        id: siteUrl,
        en: `${siteUrl}/en`,
      },
    },
    openGraph: {
      type: "website",
      locale: loc === "id" ? "id_ID" : "en_US",
      url: canonical,
      siteName: siteFacts.businessName,
      title: site.meta.title,
      description: site.meta.description,
      images: [{ url: ogImage, alt: site.hero.firstFrameAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: site.meta.title,
      description: site.meta.description,
      images: [ogImage],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }
  const loc = locale as "id" | "en";
  setRequestLocale(loc);

  const messages = await getMessages(); // next-intl: uses setRequestLocale above
  const site = getSite(loc);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["SportsActivityLocation", "LocalBusiness"],
    name: siteFacts.businessName,
    description: site.meta.description,
    url: loc === "id" ? siteUrl : `${siteUrl}/en`,
    telephone: "+628111592462",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Pejeng Kelod, Tampaksiring",
      addressLocality: "Tampaksiring",
      addressRegion: "Gianyar Regency",
      postalCode: "80552",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteFacts.latitude,
      longitude: siteFacts.longitude,
    },
    openingHours: "Mo-Su 08:00-21:30",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: siteFacts.ratingValue,
      reviewCount: siteFacts.ratingCount,
    },
    sameAs: [siteFacts.mapsUrl],
  };

  return (
    <html lang={loc}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Sans+Extra+Condensed:ital,wght@0,600;0,700;1,600&family=Inter+Tight:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-sand font-body text-ink">
        <NextIntlClientProvider messages={messages}>
          <LenisProvider />
          {/* Paket 3 background layers — site-wide, behind content.
              They never touch the hero or the ball (built 1:1 by a later worker). */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
          >
            <ScrollCrossfade />
            <Aurora />
            <Grain />
            <CursorGlow />
          </div>

          <div className="relative z-10">
            <Nav nav={site.nav} />
            <main className="pb-16 md:pb-0">{children}</main>
            <Footer footer={site.footer} />
          </div>

          <StickyWhatsAppBar bar={site.stickyBar} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
