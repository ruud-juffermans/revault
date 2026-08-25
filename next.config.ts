import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    // 'unsafe-inline' is required for Next's bootstrap scripts (incl.
    // InitColorSchemeScript) and Emotion's style tags. Production-only:
    // next dev needs eval.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || "https://api.revault.nl"}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "Content-Security-Policy", value: csp }]
            : []),
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Canonical host: www.revault.nl → revault.nl (apex is canonical).
      {
        source: "/:path*",
        has: [{ type: "host", value: "www\\.revault\\.nl" }],
        destination: "https://revault.nl/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // Dev convenience: with NEXT_PUBLIC_API_URL unset the browser calls
      // same-origin /api/*, which this rewrite proxies to the local server
      // (server/) on :4000. Production bakes the absolute API origin in instead.
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
