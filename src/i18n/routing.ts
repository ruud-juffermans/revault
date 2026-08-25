import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["nl", "en"],
  defaultLocale: "nl",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/services": { nl: "/wallet-herstel", en: "/wallet-recovery" },
    "/services/[slug]": { nl: "/wallet-herstel/[slug]", en: "/wallet-recovery/[slug]" },
    "/wallets/[slug]": { nl: "/wallets/[slug]", en: "/wallets/[slug]" },
    "/how-it-works": { nl: "/werkwijze", en: "/how-it-works" },
    "/pricing": { nl: "/tarieven", en: "/pricing" },
    "/about": { nl: "/over-ons", en: "/about" },
    "/faq": "/faq",
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/contact": "/contact",
    "/privacy": "/privacy",
    "/terms": { nl: "/voorwaarden", en: "/terms" },
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
