import { describe, it, expect } from "vitest";
import {
  generateRandomPasscode,
  generateSalt,
  hashPasscode,
  verifyPasscode,
} from "../lib/utils/passcode";

describe("Senior Passcode & Authentication Utilities", () => {
  it("should generate a valid 6-digit numeric passcode", () => {
    const pin = generateRandomPasscode();
    expect(pin).toHaveLength(6);
    expect(/^\d{6}$/.test(pin)).toBe(true);
  });

  it("should generate a non-empty unique cryptographic salt", () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1).not.toBe(salt2);
    expect(salt1.length).toBeGreaterThanOrEqual(32);
  });

  it("should hash and accurately verify correct passcode", () => {
    const pin = "482915";
    const salt = generateSalt();
    const hash = hashPasscode(pin, salt);

    const isMatch = verifyPasscode(pin, hash, salt);
    expect(isMatch).toBe(true);
  });

  it("should reject incorrect passcodes", () => {
    const pin = "482915";
    const salt = generateSalt();
    const hash = hashPasscode(pin, salt);

    expect(verifyPasscode("482916", hash, salt)).toBe(false);
    expect(verifyPasscode("000000", hash, salt)).toBe(false);
    expect(verifyPasscode("", hash, salt)).toBe(false);
  });

  it("should handle invalid inputs gracefully without throwing uncaught exceptions", () => {
    expect(verifyPasscode("", "", "")).toBe(false);
    expect(verifyPasscode("123456", "invalid-hex", "salt")).toBe(false);
  });
});
