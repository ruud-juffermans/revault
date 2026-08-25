// Detects material that must never be sent through the intake form (PRD §7):
// BIP-39 recovery phrases and raw private keys. Detection is deliberately
// conservative — a false positive only costs the visitor a rephrase, a false
// negative means a secret lands in our inbox and database.
import { wordlist } from "@scure/bip39/wordlists/english.js";

const BIP39 = new Set(wordlist);

/** Minimum run of consecutive wordlist words that counts as a seed phrase. */
export const SEED_RUN_THRESHOLD = 8;

export type SecretKind = "seed-phrase" | "private-key";

/** Longest run of consecutive BIP-39 words in the text. */
export function longestBip39Run(text: string): number {
  const tokens = text.toLowerCase().split(/[^a-z]+/);
  let best = 0;
  let run = 0;
  for (const tok of tokens) {
    if (tok && BIP39.has(tok)) {
      run += 1;
      if (run > best) best = run;
    } else if (tok) {
      run = 0;
    }
    // Empty tokens (from consecutive separators) don't break a run.
  }
  return best;
}

const PRIVATE_KEY_PATTERNS: RegExp[] = [
  // 64 hex chars (raw EVM/BTC key), with or without a 0x prefix.
  /\b(?:0x)?[0-9a-fA-F]{64}\b/,
  // Bitcoin WIF: base58, 51 chars starting with 5, or 52 starting with K/L;
  // testnet 9/c. Base58 excludes 0, O, I, l.
  /\b[5KLc9][1-9A-HJ-NP-Za-km-z]{50,51}\b/,
  // Extended private keys.
  /\bxprv[1-9A-HJ-NP-Za-km-z]{100,}\b/,
  // Solana / ed25519 keys as JSON byte arrays or base58 (87–88 chars).
  /\b[1-9A-HJ-NP-Za-km-z]{87,88}\b/,
  // Ethereum keystore JSON.
  /"crypto"\s*:\s*\{[^}]*"ciphertext"/i,
];

export function detectSecret(text: string): SecretKind | null {
  if (longestBip39Run(text) >= SEED_RUN_THRESHOLD) return "seed-phrase";
  if (PRIVATE_KEY_PATTERNS.some((re) => re.test(text))) return "private-key";
  return null;
}
