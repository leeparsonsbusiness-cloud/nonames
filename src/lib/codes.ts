import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

// No 0/O/1/I to avoid typos when people type the code into Instagram.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** e.g. "NN-7K4Q2" */
export function generateVerificationCode(): string {
  let s = "";
  for (let i = 0; i < 5; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `NN-${s}`;
}

/** 5-digit permanent secret passcode (e.g. "48219") */
export function generatePasscode(): string {
  return String(randomInt(10000, 99999));
}

export function cleanPasscode(input: string): string {
  return (input ?? "").trim().replace(/\s+/g, "").toUpperCase();
}

/** Find a verification code anywhere in a DM ("hey NN-7k4q2 !" -> "NN-7K4Q2"). */
export function extractVerificationCode(text: string): string | null {
  const m = /\bNN-?([A-HJ-NP-Z2-9]{5})\b/i.exec(text ?? "");
  return m ? `NN-${m[1].toUpperCase()}` : null;
}

/** Is this DM an opt-out request? */
export function isOptOutMessage(text: string): boolean {
  return /^\s*(opt[\s-]?out|stop|remove me)\s*[.!]*\s*$/i.test(text ?? "");
}

/** Verify Meta's X-Hub-Signature-256 header against the raw request body. */
export function verifyMetaSignature(rawBody: string, header: string | null, appSecret: string): boolean {
  if (!header || !header.startsWith("sha256=") || !appSecret) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const given = header.slice("sha256=".length);
  if (given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given, "hex"), Buffer.from(expected, "hex"));
}
