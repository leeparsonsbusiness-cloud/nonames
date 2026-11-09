import { describe, it, expect } from "vitest";
import { normalizeUsername, isValidUsername, parseUsername } from "../username";
import { ageFromDob, isAdult, daysUntil } from "../dates";
import {
  generateVerificationCode,
  extractVerificationCode,
  isOptOutMessage,
  verifyMetaSignature,
} from "../codes";
import { createHmac } from "node:crypto";

describe("username utilities", () => {
  it("normalizes handles correctly", () => {
    expect(normalizeUsername("@Lee_Parsons.")).toBe("lee_parsons.");
    expect(normalizeUsername("https://www.instagram.com/ucla.bruin/")).toBe("ucla.bruin");
    expect(normalizeUsername("instagram.com/champaignresults?igsh=123")).toBe("champaignresults");
    expect(normalizeUsername("  @@@cool_cat  ")).toBe("cool_cat");
  });

  it("validates handles according to IG rules", () => {
    expect(isValidUsername("jordan")).toBe(true);
    expect(isValidUsername("jordan.k_23")).toBe(true);
    expect(isValidUsername(".jordan")).toBe(false); // starts with dot
    expect(isValidUsername("jordan.")).toBe(false); // ends with dot
    expect(isValidUsername("jordan..k")).toBe(false); // consecutive dots
    expect(isValidUsername("bad username with space")).toBe(false);
    expect(isValidUsername("a".repeat(31))).toBe(false); // max 30
  });

  it("parses valid handles or returns null", () => {
    expect(parseUsername("@Valid_user123")).toBe("valid_user123");
    expect(parseUsername("invalid..dots")).toBe(null);
  });
});

describe("date and age utilities", () => {
  const refDate = new Date("2026-11-08T12:00:00Z");

  it("calculates age accurately", () => {
    // Exactly 18 years ago today: 2008-11-08
    expect(ageFromDob("2008-11-08", refDate)).toBe(18);
    // Turns 18 tomorrow: 2008-11-09 -> currently 17
    expect(ageFromDob("2008-11-09", refDate)).toBe(17);
    // Older adult: 2000-01-01 -> 26
    expect(ageFromDob("2000-01-01", refDate)).toBe(26);
    // Invalid dates
    expect(ageFromDob("not-a-date", refDate)).toBe(null);
    expect(ageFromDob("2030-01-01", refDate)).toBe(null); // future
  });

  it("enforces 18+ adult boundary", () => {
    expect(isAdult("2008-11-08", refDate)).toBe(true);
    expect(isAdult("2008-11-09", refDate)).toBe(false);
    expect(isAdult("2010-05-15", refDate)).toBe(false);
  });

  it("calculates days until expiry", () => {
    const future = new Date(refDate.getTime() + 10 * 86_400_000);
    expect(daysUntil(future, refDate)).toBe(10);
    const past = new Date(refDate.getTime() - 86_400_000);
    expect(daysUntil(past, refDate)).toBe(0);
  });
});

describe("code generation and verification", () => {
  it("generates formatted verification codes without ambiguous chars", () => {
    const code = generateVerificationCode();
    expect(code).toMatch(/^NN-[A-HJ-NP-Z2-9]{5}$/);
    expect(code).not.toContain("0");
    expect(code).not.toContain("O");
    expect(code).not.toContain("1");
    expect(code).not.toContain("I");
  });

  it("extracts verification code anywhere in a DM text", () => {
    expect(extractVerificationCode("Hey! My code is NN-7K4Q2")).toBe("NN-7K4Q2");
    expect(extractVerificationCode("nn-7k4q2")).toBe("NN-7K4Q2");
    expect(extractVerificationCode("NN7K4Q2")).toBe("NN-7K4Q2");
    expect(extractVerificationCode("just chatting here")).toBe(null);
  });

  it("detects opt-out intent", () => {
    expect(isOptOutMessage("opt out")).toBe(true);
    expect(isOptOutMessage("OPT-OUT!")).toBe(true);
    expect(isOptOutMessage("stop")).toBe(true);
    expect(isOptOutMessage("remove me")).toBe(true);
    expect(isOptOutMessage("Please don't stop")).toBe(false);
  });

  it("verifies Meta webhook signature correctly", () => {
    const secret = "meta_app_secret_test_123";
    const body = JSON.stringify({ object: "instagram", entry: [] });
    const validSig = "sha256=" + createHmac("sha256", secret).update(body).digest("hex");

    expect(verifyMetaSignature(body, validSig, secret)).toBe(true);
    expect(verifyMetaSignature(body, "sha256=invalidhex", secret)).toBe(false);
    expect(verifyMetaSignature(body, null, secret)).toBe(false);
  });
});
