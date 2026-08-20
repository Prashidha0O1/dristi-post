# Deploying to Codeberg Pages

This project is a static export of a Next.js (App Router) site, built by a Forgejo Actions
workflow and published to Codeberg Pages.

```
git push (main)
   ↓
Forgejo Actions runner picks up .forgejo/workflows/deploy.yml
   ↓
npm ci && npm run build   (next build, output: "export")
   ↓
out/ (static HTML/CSS/JS)
   ↓
codeberg.org/git-pages/action@v2 uploads out/ to the git-pages server
   ↓
https://pulsexel.codeberg.page/news-portal/
```

## Prerequisites — read this before pushing

Forgejo Actions on Codeberg is **not enabled by default** and Codeberg's own hosted runners are
currently offered only in a limited open alpha (see
[codeberg.org/actions/meta](https://codeberg.org/actions/meta)). To actually get a build running
you need one of the following:

1. Access to Codeberg's hosted Actions alpha for this repository/org, **or**
2. Your own self-hosted Forgejo Actions runner registered to this repository, its owning
   organization, or your account (see
   [Codeberg's self-hosted runner guide](https://docs.codeberg.org/ci/actions/)). The runner must
   be able to execute Docker-based actions, since the deploy step
   (`codeberg.org/git-pages/action`) runs in a container.

Either way, Actions must be turned on for this repository:
**Repository Settings → Units → Overview → enable Actions.**

Pushing the workflow file alone will not deploy anything until Actions is enabled and a runner is
available to pick up the job. The queued job will say "Waiting for a runner with the following
label: docker" until one exists.

### Setting up a self-hosted runner (Linux/WSL2)

Official docs: [Forgejo Runner installation](https://forgejo.org/docs/latest/admin/actions/installation/binary/),
[registration](https://forgejo.org/docs/latest/admin/actions/registration/),
[configuration](https://forgejo.org/docs/latest/admin/actions/configuration/). On Windows, run
this inside WSL2 (Ubuntu/Debian) with Docker installed there (Docker Desktop's WSL2 integration
works fine) — the Forgejo Runner binary itself is Linux-only.

1. **Get a registration token.** On Codeberg: repository → Settings → Actions → Runners → Create
   new Runner. This shows a UUID and a token — copy both, you'll paste them into the runner config
   below.

2. **Download and install the binary** (inside WSL2):

   ```bash
   export ARCH=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/')
   export RUNNER_VERSION=$(curl -X 'GET' https://data.forgejo.org/api/v1/repos/forgejo/runner/releases/latest | jq .name -r | cut -c 2-)
   export FORGEJO_URL="https://code.forgejo.org/forgejo/runner/releases/download/v${RUNNER_VERSION}/forgejo-runner-${RUNNER_VERSION}-linux-${ARCH}"
   wget -O forgejo-runner ${FORGEJO_URL} || curl -o forgejo-runner ${FORGEJO_URL}
   chmod +x forgejo-runner
   sudo cp forgejo-runner /usr/local/bin/forgejo-runner
   forgejo-runner -v   # sanity check
   ```

3. **Make sure Docker is reachable** by whichever user will run the daemon (add them to the
   `docker` group: `sudo usermod -aG docker $USER`, then start a new shell).

4. **Generate a config file and register it:**

   ```bash
   forgejo-runner generate-config > runner-config.yml
   ```

   Edit `runner-config.yml`:

   - Under `server.connections`, add the UUID/token from step 1:

     ```yaml
     server:
       connections:
         codeberg:
           url: https://codeberg.org/
           uuid: <uuid-from-step-1>
           token: <token-from-step-1>
     ```

   - Under the runner's `labels`, add an entry named `docker` (matching `runs-on: docker` in
     [.forgejo/workflows/deploy.yml](.forgejo/workflows/deploy.yml)) pointing at an image with
     Node/git available:

     ```yaml
     labels:
       - docker:docker://ghcr.io/catthehacker/ubuntu:act-22.04
     ```

5. **Start it:**

   ```bash
   forgejo-runner daemon -c runner-config.yml
   ```

   Leave that running (or set it up as a systemd service — see the official docs above — to
   survive reboots). Once it's up, the queued "build-and-deploy" job on Codeberg should pick it up
   within a few seconds without needing to push again.

## Deployment branch

`main` — this is the repository's current default branch (confirmed via `git branch
--show-current`/`git remote -v`, owner `Pulsexel`, repo `news-portal`). The workflow only triggers
on pushes to `main`.

## Build command & output directory

- Build command: `npm run build` (already invokes `next build`; no changes were made to this
  script)
- Output directory: `out/` (produced because `next.config.ts` sets `output: "export"`)
- Package manager: npm, using the committed `package-lock.json` (`npm ci` in CI for a
  deterministic install)

## Base path

Codeberg Pages serves project sites at `https://<owner>.codeberg.page/<repo>/`, not at the domain
root. `next.config.ts` sets `basePath` accordingly:

```ts
const basePath = process.env.CODEBERG_PAGES_BASE_PATH || "/news-portal";
```

The default (`/news-portal`) matches this repository's actual name, so local `npm run build` runs
produce a working export without any extra setup. The workflow also sets
`CODEBERG_PAGES_BASE_PATH` explicitly so the base path used by the CI build always matches the
`site:` URL passed to the deploy action, even if one or the other is edited later — if you rename
the repository, update both together.

`trailingSlash: true` is also set, so every route exports as `route/index.html` — this is the
layout static file hosts (Codeberg Pages included) resolve correctly without extra rewrite rules.

## Images

`next/image` is used with remote `picsum.photos` URLs (placeholder images for the mock article
data). Static export doesn't support the default Next.js image optimizer (it needs a Node
server), so `images.unoptimized: true` is set. `next/image` then renders a plain `<img>` tag
pointing directly at the original URL — no image optimization happens, but nothing breaks. No
image-optimization service/runtime was introduced.

## Dynamic routes

Two dynamic routes exist:

- `app/article/[slug]/page.tsx`
- `app/category/[slug]/page.tsx`

Both were originally `"use client"` pages reading the slug via `useParams()`. Static export
requires `generateStaticParams()`, which **cannot** be exported from a Client Component. Each was
split into:

- `page.tsx` — a Server Component that exports `generateStaticParams()` (returning every known
  article slug / category slug from the existing mock data) and forwards `params.slug` as a prop
- `ArticlePageClient.tsx` / `CategoryPageClient.tsx` — the original client component, now taking
  `slug` as a prop instead of calling `useParams()`

No UI, styling, or data changed — this is purely a structural split needed to make prerendering
possible. All 12 mock articles and all 10 categories are prerendered at build time (visible in the
`next build` route summary as `● (SSG)` entries).

## What is NOT compatible with static export (none of this project currently uses them)

Checked and confirmed absent from this codebase:

- API routes / Route Handlers
- Server Actions
- Middleware
- `cookies()` / `headers()`
- `next.config.ts` `redirects`/`rewrites`/`headers`
- Any server-only environment variables read at request time

The only `fetch()` calls in the app (`components/header.tsx`, live weather/exchange-rate widgets)
run client-side in the browser after hydration — this works identically whether the page is
server-rendered or a static file, so no changes were needed there.

## Environment variables

No `.env*` files or secrets are read at build time. `CODEBERG_PAGES_BASE_PATH` (set in the
workflow) is a plain build-time config value, not a secret, and isn't prefixed `NEXT_PUBLIC_*`
because it only affects `next.config.ts`, not client code. No Codeberg repository secrets are
required for this workflow as written — `forge.token` is provided automatically by Forgejo
Actions for each run.

## Testing the static export locally

```bash
npm run build
npx serve out
```

(or any other static file server — just don't open `out/index.html` directly via `file://`, since
the base-path-prefixed asset URLs need an actual HTTP server to resolve). To test it exactly as
Codeberg Pages will serve it, serve the `out/` directory from underneath a `news-portal/` folder
and hit `http://localhost:<port>/news-portal/`.

## Known limitations

- Rebuilding requires either the Codeberg-hosted Actions alpha or a self-hosted runner (see
  Prerequisites above) — this is a Codeberg platform constraint, not something fixable from this
  repository.
- All article/category content is static mock data baked in at build time. Adding a real CMS/API
  later would need either a rebuild-on-content-change pipeline (still static-export-compatible)
  or a move off static export entirely if true runtime dynamic rendering becomes a requirement.

## Custom domain (for later)

The `git-pages` action supports custom domains. Once you own a domain and have pointed its DNS at
Codeberg Pages, change the deploy step to:

```yaml
- uses: https://codeberg.org/git-pages/action@v2
  with:
    site: https://yourdomain.com/
    server: codeberg.page
    token: ${{ forge.token }}
    source: out/
```

`server: codeberg.page` is required the first time a custom domain is set up (it lets the action
obtain a TLS certificate before the domain is actually resolvable to it). See
[Codeberg's Pages docs](https://docs.codeberg.org/codeberg-pages/) for the DNS records you need to
add.
