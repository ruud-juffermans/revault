import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["nl", "en"],
  defaultLocale: "nl",
  localePrefix: "as-needed",
  // Always land on Dutch; do not redirect based on Accept-Language. Visitors pick English via the switcher.
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/services": { nl: "/wallet-herstel", en: "/wallet-recovery" },
    "/services/[slug]": { nl: "/wallet-herstel/[slug]", en: "/wallet-recovery/[slug]" },
    "/wallets/[slug]": { nl: "/wallets/[slug]", en: "/wallets/[slug]" },
    "/how-it-works": { nl: "/werkwijze", en: "/how-it-works" },
    "/pricing": { nl: "/tarieven", en: "/pricing" },
    "/about": { nl: "/over-mij", en: "/about" },
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
