// Prints a password hash you can paste into a SQL INSERT for the users table.
// Needs nothing but Node:
//   node scripts/hash-password.mjs
// The password is prompted for (masked) so it stays out of shell history, and
// the format matches lib/auth/password.ts exactly.

import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import readline from "node:readline";

const scrypt = promisify(scryptCb);

function ask(question, { mask = false } = {}) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  if (mask) rl._writeToOutput = (s) => rl.output.write(s.includes("\n") ? "\n" : "");
  return new Promise((resolve) => rl.question(question, (a) => { rl.close(); resolve(a); }));
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

const salt = randomBytes(16);
const derived = await scrypt(password, salt, 64);
const hash = `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;

console.log("\nPassword hash (copy the whole line):\n");
console.log(hash);
