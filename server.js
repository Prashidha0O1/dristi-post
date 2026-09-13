// Passenger startup file for cPanel's "Setup Node.js App".
//
// cPanel runs this file to boot the app. It starts Next.js's production server
// and listens on the port Passenger provides via process.env.PORT. Requires a
// completed `npm run build` (the .next/ folder) and installed node_modules in
// the same directory.
//
// CommonJS on purpose: package.json has no "type": "module", so require() is
// the right form here.

const { readFileSync } = require("node:fs");
const path = require("node:path");
const next = require("next");
const { createServer } = require("http");

// Load env files into process.env BEFORE anything reads DATABASE_URL. A bare
// custom server does not auto-load these, which is why the live server had no
// DATABASE_URL and never connected. Existing values win, so environment
// variables set in cPanel's Node.js App UI (injected by Passenger) still take
// precedence over the file.
for (const file of [".env.local", ".env.production", ".env"]) {
  try {
    const text = readFileSync(path.join(__dirname, file), "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* file absent — fine */
  }
}

const port = process.env.PORT || 3000;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`> News portal ready on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start Next.js server:", err);
    process.exit(1);
  });
