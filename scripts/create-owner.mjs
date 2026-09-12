// Create the first OWNER account. Run once after the database is set up:
//   node scripts/create-owner.mjs you@example.com "Your Name"
// The password is prompted for (masked) — never pass it as an argument, so it
// stays out of shell history. Hashing matches lib/auth/password.ts exactly.

import { readFileSync } from "node:fs";
import { randomBytes, randomUUID, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import readline from "node:readline";
import mysql from "mysql2/promise";

const scrypt = promisify(scryptCb);

// --- load .env.local / .env for DATABASE_URL ---
for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* absent — fine */ }
}

const [email, name] = process.argv.slice(2);
if (!email || !name) {
  console.error('Usage: node scripts/create-owner.mjs <email> "<name>"');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (put it in .env.local).");
  process.exit(1);
}

function ask(question, { mask = false } = {}) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  if (mask) {
    // Suppress echo of typed characters.
    rl._writeToOutput = (s) => rl.output.write(s.includes("\n") ? "\n" : "");
  }
  return new Promise((resolve) => rl.question(question, (a) => { rl.close(); resolve(a); }));
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

const password = await ask("Password: ", { mask: true });
const confirm = await ask("Confirm password: ", { mask: true });
if (password.length < 8) {
  console.error("\nPassword must be at least 8 characters.");
  process.exit(1);
}
if (password !== confirm) {
  console.error("\nPasswords do not match.");
  process.exit(1);
}

const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL });
try {
  const [existing] = await conn.query("SELECT id FROM users WHERE email = ? LIMIT 1", [
    email.trim().toLowerCase(),
  ]);
  if (existing.length) {
    console.error(`\nA user with ${email} already exists.`);
    process.exit(2);
  }
  await conn.query(
    `INSERT INTO users (id, email, passwordHash, name, role, isActive, emailVerifiedAt)
     VALUES (?, ?, ?, ?, 'OWNER', 1, NOW(3))`,
    [randomUUID(), email.trim().toLowerCase(), await hashPassword(password), name],
  );
  console.log(`\nOwner account created for ${email}. You can now sign in at /login.`);
} finally {
  await conn.end();
}
