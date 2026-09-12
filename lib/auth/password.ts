import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Password hashing with Node's built-in scrypt.
 *
 * scrypt is deliberately chosen over bcrypt/argon2: those are native addons
 * whose prebuilt binaries must match the runtime's OS/arch, which is a real
 * risk when the CI runner and the cPanel host differ. scrypt ships with Node,
 * so it behaves identically everywhere and adds no dependency.
 *
 * Stored format: `scrypt$<saltHex>$<hashHex>`. Self-describing, so the
 * parameters can change later without a migration ambiguity.
 */

const scryptAsync = promisify(scrypt);
const KEY_LEN = 64;
const SALT_LEN = 16;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const derived = (await scryptAsync(password, salt, expected.length)) as Buffer;

  // Constant-time compare so a mismatch's timing can't leak the hash.
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}
