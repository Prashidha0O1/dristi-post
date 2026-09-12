// Quick database smoke test. Run after setting DATABASE_URL:
//   node scripts/check-db.mjs
// It loads .env.local (or .env) if present, connects, and checks that every
// table exists and the seed is in place. It makes no changes.

import { readFileSync } from "node:fs";
import mysql from "mysql2/promise";

// Minimal .env loader so this runs without extra dependencies.
for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* file absent — fine */
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Put it in .env.local first.");
  process.exit(1);
}

const EXPECTED_TABLES = [
  "articles", "categories", "authors", "tags", "article_tags",
  "jobs", "ads", "users", "sessions", "invites",
];

const conn = await mysql.createConnection({ uri: url, connectTimeout: 8000 });
try {
  const [[{ v }]] = await conn.query("SELECT 1 AS v");
  console.log(v === 1 ? "OK  connected" : "??  unexpected SELECT 1 result");

  const [tables] = await conn.query("SHOW TABLES");
  const present = new Set(tables.map((r) => Object.values(r)[0]));
  let allTables = true;
  for (const t of EXPECTED_TABLES) {
    const ok = present.has(t);
    if (!ok) allTables = false;
    console.log(`${ok ? "OK " : "!! "} table ${t}${ok ? "" : "  MISSING"}`);
  }

  const [[cats]] = await conn.query("SELECT COUNT(*) AS n FROM categories");
  const [[authors]] = await conn.query("SELECT COUNT(*) AS n FROM authors");
  console.log(`--  categories: ${cats.n} (expect 15 after seed), authors: ${authors.n} (expect >= 1)`);

  if (!allTables) {
    console.error("\nSome tables are missing — import db/schema.sql via phpMyAdmin.");
    process.exit(2);
  }
  if (cats.n === 0 || authors.n === 0) {
    console.error("\nNo seed data — import db/seed.sql via phpMyAdmin (fresh install).");
    process.exit(3);
  }
  console.log("\nDatabase looks ready.");
} finally {
  await conn.end();
}
