import crypto from "crypto";

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

/**
 * Generates a random 6-digit passcode.
 */
export function generateRandomPasscode(): string {
  const pin = crypto.randomInt(100000, 999999).toString();
  return pin;
}

/**
 * Generates a random salt.
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Hashes a passcode using PBKDF2 with SHA-512 and a unique salt.
 */
export function hashPasscode(passcode: string, salt: string): string {
  const hash = crypto.pbkdf2Sync(
    passcode.trim(),
    salt,
    ITERATIONS,
    KEY_LENGTH,
    DIGEST
  );
  return hash.toString("hex");
}

/**
 * Verifies a candidate passcode against stored hash and salt using timingSafeEqual.
 */
export function verifyPasscode(
  candidate: string,
  storedHash: string,
  salt: string
): boolean {
  if (!candidate || !storedHash || !salt) {
    return false;
  }

  try {
    const candidateHash = hashPasscode(candidate, salt);
    const candidateBuffer = Buffer.from(candidateHash, "hex");
    const storedBuffer = Buffer.from(storedHash, "hex");

    if (candidateBuffer.length !== storedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(candidateBuffer, storedBuffer);
  } catch {
    return false;
  }
}
