import { SITE_URL } from "@/lib/seo";

// The person behind Revault. Copy (name, role, bio) lives in messages under
// `founder`; this module holds the facts that don't need translating.
export const FOUNDER = {
  name: "Ruud Juffermans",
  linkedin: "https://www.linkedin.com/in/r-j3",
  portrait: { src: "/ruud-juffermans-portrait.jpg", width: 1152, height: 1366 },
  speaking: { src: "/ruud-juffermans-speaking.jpg", width: 1774, height: 887 },
} as const;

/** Stable @id for the Person node, referenced from Organization.founder and Article.author. */
export const PERSON_ID = `${SITE_URL}/#ruud-juffermans`;
