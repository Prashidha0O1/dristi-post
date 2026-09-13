# Deploying to cPanel (manual)

Build and run the app on the server. The build does not need the database, and
Next loads `.env.local` automatically, so there are no cPanel env vars to set —
just a `.env.local` file on the server.

## First-time setup

### 1. Get the code onto the server
In cPanel → **Terminal** (or over SSH), clone the repo into the app root:
```bash
cd /home/dristiti/dristitimes-app
git clone <your-repo-url> .
```
(The trailing `.` clones into the current folder. If git isn't available, upload
a zip of the project via File Manager and extract it here instead — exclude
`node_modules` and `.next`.)

### 2. Create .env.local on the server
In `/home/dristiti/dristitimes-app/.env.local`:
```
DATABASE_URL=mysql://dristiti_admin:YOUR_PASSWORD@localhost:3306/dristiti_times
NODE_ENV=production
```
`localhost` because the app and database are on the same server.

### 3. Install and build (in the Node environment)
```bash
source /home/dristiti/nodevenv/dristitimes-app/22/bin/activate
cd /home/dristiti/dristitimes-app
npm install
npm run build
```

### 4. Create your owner login
```bash
node scripts/create-owner.mjs rawalprashidha@gmail.com "Your Name"
```

### 5. Point cPanel at the startup file
cPanel → **Setup Node.js App** → your app:
- **Application startup file:** `server.js`
- **Application mode:** Production
- Click **Restart**.

Open the site, then `/login`.

## Updating later
```bash
source /home/dristiti/nodevenv/dristitimes-app/22/bin/activate
cd /home/dristiti/dristitimes-app
git pull            # or re-upload changed files
npm install         # only if dependencies changed
npm run build
```
Then hit **Restart** in Setup Node.js App (or `touch tmp/restart.txt`).

## Notes
- **Uploads:** images are written to `public/uploads`. A rebuild does not touch
  that folder, so they persist. Keep it out of git (already in `.gitignore`).
- **Logs:** if the site won't start, check the app's log in Setup Node.js App.
- **Build runs out of memory?** Shared hosting is memory-limited. If `npm run
  build` is killed, build locally instead and upload the `.next` folder — but
  build with the same Node major (22) to match the server.
