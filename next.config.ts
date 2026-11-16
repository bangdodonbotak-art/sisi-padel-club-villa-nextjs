import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    // Pragmatic CSP for a static site: 'unsafe-inline' is required on both
    // script (Next.js App Router injects inline RSC-payload scripts) and
    // style (React/GSAP inline style attributes) sides. This CSP therefore
    // blocks external script/style injection, framing, plugins and
    // cross-origin exfiltration — it is defense-in-depth, NOT a full XSS
    // control (a nonce-based CSP would need a dynamic render). External
    // origins used by the site: Google Fonts (stylesheet + font files)
    // and Google Maps (frame-src for the Visit map embed, no API key).
    // img-src data: is needed for the inline SVG grain texture.
    // media-src 'self' covers the local lounge audio (/audio/*.mp3).
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "media-src 'self'",
      "connect-src 'self'",
      "worker-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-src https://www.google.com https://maps.google.com",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "Strict-Transport-Security",
    // Same value Vercel already sends by default; set explicitly so the
    // policy survives any non-Vercel hosting.
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    // Legacy backup for CSP frame-ancestors 'none'.
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), serial=(), hid=(), midi=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    // Site assets are only ever loaded by this site itself.
    value: "same-origin",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
];

const nextConfig: NextConfig = {
  // Next.js sends X-Powered-By by default; Vercel strips it on the live
  // deployment, but disable it here so it never leaks on any host.
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Security headers on every route (pages + error pages).
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/hero/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/padel-ball.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
