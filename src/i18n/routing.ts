import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["id", "en"],
  // English is the default (Dony 17 Nov 2026): `/` serves EN, `/id`
  // serves Indonesian. localeDetection is OFF on purpose — with it on,
  // next-intl redirects `/` to the browser's language, so an English
  // browser tapping "ID" (→ `/`) was bounced straight back to `/en`
  // and the switch looked broken. Explicit paths always win now.
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: false,
});
