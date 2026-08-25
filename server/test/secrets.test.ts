import { describe, expect, it } from "vitest";
import { detectSecret, longestBip39Run } from "../src/lib/secrets.js";

const SEED = "abandon ability able about above absent absorb abstract absurd abuse access accident";

describe("detectSecret", () => {
  it("flags a 12-word BIP-39 phrase", () => {
    expect(detectSecret(`my words are: ${SEED}`)).toBe("seed-phrase");
  });
  it("flags a phrase with line breaks and numbering", () => {
    const numbered = SEED.split(" ").map((w, i) => `${i + 1}. ${w}`).join("\n");
    expect(detectSecret(numbered)).toBe("seed-phrase");
  });
  it("does not flag ordinary English prose with a few wordlist words", () => {
    const prose =
      "I bought bitcoin in 2017 on my old laptop. The wallet file is still there but I cannot remember the password. I have some notes about it.";
    expect(longestBip39Run(prose)).toBeLessThan(8);
    expect(detectSecret(prose)).toBeNull();
  });
  it("does not flag Dutch prose", () => {
    expect(detectSecret("Ik heb een Ledger uit 2019 en ben een deel van mijn herstelwoorden kwijt, ik heb er nog acht.")).toBeNull();
  });
  it("flags a raw hex private key", () => {
    expect(detectSecret("key 0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318")).toBe("private-key");
    expect(detectSecret("4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318")).toBe("private-key");
  });
  it("flags a WIF key", () => {
    expect(detectSecret("5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ")).toBe("private-key");
    expect(detectSecret("L1aW4aubDFB7yfras2S1mN3bqg9nwySY8nkoLmJebSLD5BWv3ENZ")).toBe("private-key");
  });
  it("does not flag a transaction id mention shorter than 64 hex", () => {
    expect(detectSecret("txid starts with 3a1f9c but I don't have the rest")).toBeNull();
  });
});
