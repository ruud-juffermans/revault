import { randomInt } from "node:crypto";

// Unambiguous alphabet: no 0/O, 1/I/L.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Case reference in the form RV-YYYYMM-XXXX (PRD §7). */
export function makeReference(now = new Date()): string {
  const ym = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  let tail = "";
  for (let i = 0; i < 4; i++) tail += ALPHABET[randomInt(ALPHABET.length)];
  return `RV-${ym}-${tail}`;
}
