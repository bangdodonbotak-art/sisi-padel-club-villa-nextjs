/**
 * Root layout — intentionally minimal.
 *
 * The real <html>/<body> live in src/app/[locale]/layout.tsx (next-intl
 * App Router pattern). This file only passes children through so the
 * [locale] segment owns lang, metadata and providers.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
