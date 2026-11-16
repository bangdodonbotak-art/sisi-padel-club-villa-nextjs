import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://sisi-padel-club-villa-nextjs.vercel.app";

// Last-modified is a fixed date, bumped manually when site content
// changes — a per-build `new Date()` would change on every deploy
// without any content change, which trains crawlers to ignore it.
const lastModified = new Date("2026-11-16");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          "x-default": siteUrl,
          id: `${siteUrl}/id`,
          en: siteUrl,
        },
      },
    },
    {
      url: `${siteUrl}/id`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          "x-default": siteUrl,
          id: `${siteUrl}/id`,
          en: siteUrl,
        },
      },
    },
  ];
}
