// Editorial artwork used across the site. Sources are optimised JPEG/WebP
// derivatives in public/ (the 2–4 MB PNG originals are not committed).
// The photo goes through next/image; the guilloché tile is a CSS background
// and is therefore served as-is, hence the small 640px WebP.
export const ART = {
  /** Close-up of a brass safe dial, subject on the right, dark empty space on the left. */
  safeDial: { src: "/safe-dial.jpg", width: 1672, height: 941 },
  /** Seamless 1:1 guilloché rosette (gold linework on near-black), for tiling. */
  guillocheTile: "/guilloche-tile.webp",
} as const;
