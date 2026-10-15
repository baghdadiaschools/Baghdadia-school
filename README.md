# مدرسة البغدادية · Baghdadia School

A mobile-first, Arabic-default school companion built with React, TypeScript, Vite and Express. English, RTL/LTR, light/dark themes, an original animated video introduction, eight empty school sections, and an installable PWA are included. No login, database, AI subscription or API key is needed.

## Start in Visual Studio Code on Windows

1. Install **Node.js 22 or newer LTS** from https://nodejs.org (include npm). Restart VS Code after installation.
2. Extract the entire ZIP into a folder, for example `Documents\Baghdadia-school`. Do not run from inside the ZIP.
3. In VS Code choose **File → Open Folder** and select the folder containing `package.json`.
4. Choose **Terminal → New Terminal**. Run:

```sh
npm install
npm run dev
```

5. Open `http://localhost:5173` in your browser. Vite runs the frontend on 5173 and proxies `/api` to Express on 3001. If Vite chooses another free port, use the address shown in the terminal.
6. Stop both servers with **Ctrl+C** in that terminal.

The locked, reproducible installation command is `npm ci`. Your first visit uses Arabic and light mode. Use the header to switch language or theme; preferences remain on that browser. All eight categories are intentionally empty. The disabled AI composer is clearly labelled and makes no AI requests.

### Windows troubleshooting

- “npm.ps1 cannot be loaded”: choose **Command Prompt** from the VS Code terminal dropdown, or use `npm.cmd install` and `npm.cmd run dev`. No PowerShell policy change is necessary.
- “node/npm not recognized”: reinstall Node.js with PATH support and restart VS Code.
- “package.json not found”: open the extracted project folder, not its parent. Use `dir` to check.
- Port 3001 occupied: stop the other server. The development proxy expects 3001; if you deliberately change it, update `vite.config.ts` too. Production accepts `PORT`.
- Installation fails: check internet access to registry.npmjs.org. Do not disable TLS verification.
- Old offline version: close all tabs and reopen after an update. For development troubleshooting, clear this site's service worker in browser developer tools → Application → Service Workers. Production updates keep the previous worker until existing tabs close.

## Test on a phone

Connect the phone and computer to the same trusted Wi-Fi. Run `npm run dev`, then use the Network URL printed by Vite (your computer's LAN address, port 5173). Allow Node through Windows Firewall for **private networks** if prompted. This LAN HTTP workflow tests layout, but service workers and installation need HTTPS (localhost on the computer also qualifies). Do not expose the development server directly to the public internet.

On an HTTPS deployment: Android Chrome → menu → Install app/Add to Home screen. iPhone/iPad Safari → Share → Add to Home Screen. Desktop Chrome/Edge offer installation from the address bar or menu. These are PWA installs, not native APK/IPA packages. Browser installation UI varies.

## Build and run production

```sh
npm ci
npm run build
npm start
```

Open `http://localhost:3001`. Express serves both the build and API, including direct navigation/refresh on section routes. Build includes TypeScript checking. Health is `GET /api/health`; `GET /api/categories` returns exactly eight empty sections and `aiEnabled: false`. Unknown API paths return JSON 404s. Production adds security headers, same-origin requests and graceful shutdown.

Default configuration: `PORT=3001`, `HOST=0.0.0.0`. No environment file is required. For custom production configuration, copy `.env.example` to `.env` and run:

```sh
node --env-file=.env server/index.js --production
```

`npm start` reads inherited variables; it does not automatically load `.env`. Never put secrets in Vite variables or public assets.

## Verification

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright starts the production server automatically. On Linux with existing Chromium, set `CHROMIUM_PATH=/usr/bin/chromium` to reuse it. Browser tests cover defaults, the actual video asset, all eight routes and empty states, refresh routing, preferences, 320/390/768/1440px layouts, both themes and languages, manifest assets and offline behavior. See `docs/VALIDATION.md` for the checks actually run for this delivery.

## Deploy to your own server

A public app needs hosting infrastructure and optionally a domain, which may have external costs. No paid API is needed. Use a Linux VPS with Docker and Docker Compose, plus Caddy on the host for automatic HTTPS.

1. Upload this project (without node_modules or .env containing local configuration) to the server.
2. From the project folder run `docker compose up -d --build`.
3. Check `docker compose ps`, `docker compose logs -f school` and `curl http://127.0.0.1:3001/api/health`.
4. Point your domain's DNS A record to the server IPv4 address. Set AAAA only if IPv6 is configured correctly.
5. Install Caddy using its official instructions at https://caddyserver.com/docs/install. Copy the contents of `docs/Caddyfile.example` to the host Caddy configuration and replace `school.example.com` with your domain.
6. Allow inbound ports **80 and 443** and reload Caddy. It obtains and renews TLS certificates automatically when DNS and connectivity are correct. Port 3001 is bound to loopback by Compose; keep it private.
7. Visit the HTTPS domain and check `/api/health` and a direct route such as `/homework`. Test installation on your phones.

Commands from the project folder:

```sh
docker compose logs -f school
docker compose restart school
docker compose stop
docker compose up -d
# After uploading a new release:
docker compose up -d --build
# Remove containers (keeps your source files):
docker compose down
```

The multi-stage Dockerfile runs the application as a non-root user, installs locked dependencies and includes a health check. Keep the previous project release or image for rollback. No database or user records exist in this version. Docker and HTTPS deployment must be verified on your hosting infrastructure before public launch.

## Project map and future development

- `src/main.tsx`: app shell, dashboard, empty category interfaces, settings, about and splash.
- `src/categories.ts`: exactly eight category definitions and icon identities.
- `src/i18n/ar.ts`, `en.ts`: all interface translations, initialized through i18next.
- `src/styles.css`: responsive design tokens, both themes and reduced-motion support.
- `server/app.js`: testable Express app and read-only API; `server/index.js`: process entry.
- `public/assets/school-intro.mp4`: original uploaded H.264 video, unchanged. Logo and PNG app icons are extracted from its final frame.
- `public/sw.js`: production-only offline shell cache; API and video are never cached by the service worker.
- `public/manifest.webmanifest`: install metadata and icons.

The introduction plays muted and inline, once per tab session. Users can skip immediately; video failure, autoplay rejection and a five-second timeout all release the splash. Reduced-motion users skip the introduction. Offline users can reopen the shell after a successful online visit; backend connectivity is reported honestly. The video can fall back to its poster without trapping navigation. Cache version should be incremented in `sw.js` for releases that change stable public assets. Hashed JavaScript/CSS assets invalidate automatically. The service worker deliberately does not force-reload open sessions.

No fictional assignments, classes, teachers, exams, notices, schedules, or chat responses are included. Actual school content and authenticated functionality can be added later. Before adding personal student information, design authentication, permissions, secure storage and the relevant privacy controls.

### Container validation note

The cloud environment validated Compose syntax but could not complete the Docker build because container DNS resolution to the npm registry failed (`EAI_AGAIN`). The Node production build and Chromium tests passed. Run `docker compose up -d --build` and verify its health check on your target host before deploying.

## Free cloud hosting (PC can be off)

See [the Render deployment guide](docs/RENDER.md). The included `render.yaml` configures a Free Node web service serving both the app and API. Connect your GitHub repository and choose branch `feat/baghdadia-school-app`. Hosting requires your own Render account; free-tier availability and limits are controlled by Render.
