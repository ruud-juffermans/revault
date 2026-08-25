"use client";

import { useEffect } from "react";
import { recordPageView } from "@/lib/api";

/** Records a single page view on mount. Renders nothing. */
export default function PageViewTracker({ path, locale }: { path: string; locale?: string }) {
  useEffect(() => {
    recordPageView(path, locale);
  }, [path, locale]);
  return null;
}
