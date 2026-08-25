import { notFound } from "next/navigation";

// Unknown paths under a valid locale → [locale]/not-found.tsx.
export default function CatchAllPage() {
  notFound();
}
