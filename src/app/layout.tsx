// Pass-through root layout: <html>/<body> live in [locale]/layout.tsx (they
// need the locale); Next requires a root layout for app/not-found.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
