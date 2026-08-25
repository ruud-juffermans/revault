import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";

export const alt = "Revault — Crypto wallet recovery";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Static, one per locale. Fonts are the OG renderer's defaults on purpose:
// bundling the site fonts here would double the cost of every image route.
export default async function OpenGraphImage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "og" });
  const promises = [t("promise1"), t("promise2"), t("promise3")];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #111418 0%, #1C2128 100%)",
          color: "#F4F1EA",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#E2B15A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, border: "4px solid #111418" }} />
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>Revault</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2, maxWidth: 980 }}>{t("title")}</div>
          <div style={{ fontSize: 30, color: "#B8B3A8", maxWidth: 900 }}>{t("subtitle")}</div>
        </div>
        <div style={{ display: "flex", gap: 36, fontSize: 24, color: "#E2B15A" }}>
          {promises.map((p) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: "#E2B15A" }} />
              <span style={{ color: "#F4F1EA" }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
