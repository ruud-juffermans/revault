import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Revault — Crypto Wallet Recovery",
    short_name: "Revault",
    description: "Non-custodial crypto wallet recovery. No recovery, no fee.",
    start_url: "/",
    display: "browser",
    background_color: "#F7F6F2",
    theme_color: "#B7791F",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
