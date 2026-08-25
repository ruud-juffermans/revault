// 404 for paths outside any locale (dotted paths skip the i18n middleware and
// reach [locale] as an invalid locale). Minimal document: no theme, no i18n.
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#0C0F14", color: "#F4F6F9", fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
        <div>
          <p style={{ letterSpacing: "0.12em", color: "#E2B15A", margin: 0 }}>404</p>
          <h1 style={{ fontSize: 28, margin: "12px 0 24px" }}>Page not found</h1>
          <a href="/" style={{ color: "#E2B15A" }}>revault.nl</a>
        </div>
      </body>
    </html>
  );
}
