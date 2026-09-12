# Deploying to cPanel (push-to-deploy)

Pushing to `main` triggers `.github/workflows/deploy.yml`: GitHub Actions builds
the app and ships the standalone bundle to cPanel over SSH, then restarts the
Node app. One-time setup below.

## 1. Create the Node.js app in cPanel

cPanel → **Setup Node.js App** → **Create Application**:

- **Node.js version:** 20.x (must match `.nvmrc` — 20.9+).
- **Application mode:** Production.
- **Application root:** e.g. `newsportal` → the app lives at
  `/home/dristiti/newsportal`. This path is `CPANEL_APP_PATH` below.
- **Application startup file:** `server.js` (Next's standalone entry).
- Click **Create**. Leave "Run NPM Install" alone — the bundle already ships its
  own traced `node_modules`, so you do **not** run install on the server.

Then in the same screen add **Environment variables**:

- `DATABASE_URL` = `mysql://dristiti_admin:PASSWORD@localhost:3306/dristiti_times`
  (on the server it's `localhost`, not the remote host).
- `NODE_ENV` = `production`
- Optionally `UPLOADS_DIR` = a path OUTSIDE the app root (see §4).

## 2. SSH access + deploy key

The workflow needs SSH. In cPanel → **SSH Access** (or ask your host to enable
it), then create a key pair for CI:

```bash
ssh-keygen -t ed25519 -f deploy_key -N ""
```

- Put the **public** key (`deploy_key.pub`) in cPanel → SSH Access → Manage Keys
  → Import (and **Authorize** it).
- Put the **private** key (`deploy_key`) into the GitHub repo secret
  `CPANEL_SSH_KEY` (below). Never commit it.

## 3. GitHub repo secrets

Repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Value |
|---|---|
| `CPANEL_SSH_HOST` | `s1323.sgp1.mysecurecloudhost.com` |
| `CPANEL_SSH_PORT` | your SSH port (often `22`; some hosts use a custom one) |
| `CPANEL_SSH_USER` | `dristiti` (your cPanel account user) |
| `CPANEL_SSH_KEY`  | the **private** key from §2 |
| `CPANEL_APP_PATH` | absolute app root, e.g. `/home/dristiti/newsportal` |

No database or other build secrets are needed — the build never touches the DB.

## 4. Uploads must survive deploys

`rsync --delete` would wipe anything in the app root that isn't in the bundle.
Uploaded images must therefore live **outside** the app root, or every deploy
deletes them. Set `UPLOADS_DIR` (env, §1) to something like
`/home/dristiti/uploads`, and serve it at `/uploads` — either with a symlink
`ln -s /home/dristiti/uploads /home/dristiti/newsportal/public/uploads` (the
workflow already excludes `public/uploads` from `--delete`) or a web-server rule.
The default (inside `public/uploads`) is fine for local dev only.

## 5. First deploy

1. Set up the database (see `db/schema.sql`, `db/seed.sql`) and create the owner
   account with `node scripts/create-owner.mjs` (can be run locally against the
   remote DB, or on the server).
2. Push to `main` (or run the workflow manually from the Actions tab).
3. Watch the Actions run. On success, open the site and `/admin`.

## Troubleshooting

- **App won't start / 503:** check cPanel → Setup Node.js App → the app's log.
  Confirm the startup file is `server.js` and the Node version matches `.nvmrc`.
- **Passenger not restarting:** it restarts when `tmp/restart.txt` changes; the
  workflow touches it. Confirm `CPANEL_APP_PATH` is the real app root.
- **DB connection refused in production:** `DATABASE_URL` host must be
  `localhost` on the server, and the DB user attached with ALL PRIVILEGES.
- **rsync permission denied:** the deploy key isn't authorized, or the port is
  wrong.
