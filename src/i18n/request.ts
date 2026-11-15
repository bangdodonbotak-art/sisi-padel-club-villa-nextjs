import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { getMessages, isLocale } from "@/lib/content";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isLocale(requested) ? requested : routing.defaultLocale;
  return {
    locale,
    messages: getMessages(locale),
  };
});
