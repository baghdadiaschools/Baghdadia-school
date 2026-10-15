# Delivery validation

Run in the cloud environment on 2026-10-15 with Node 24.19.0 and system Chromium.

Passed:
- npm installation with locked dependency output (writable cloud cache supplied).
- TypeScript validation and Vite production build.
- Development startup: Vite frontend and Express backend; proxied /api/health returned status ok.
- Node integration suite: 1 test covering health, eight empty categories, disabled AI and unknown API response.
- Chromium Playwright: 4 tests passed (three main tests together, plus the video-failure/reduced-motion test separately).
- All eight category routes, appropriate empty states, direct-route refresh, and disabled AI input.
- Arabic RTL and light defaults; English LTR and dark preference persistence across reloads.
- Widths 320, 390, 768 and 1440, both languages and themes, with no horizontal document overflow.
- Production manifest and icon/video HTTP responses; offline shell and navigation after a successful online visit.
- Video failure and reduced-motion fallback; no page-level JavaScript exceptions in the main navigation test.
- Original uploaded video preserved byte-for-byte, H.264, 1080×1080, approximately 2 seconds.
- Docker Compose configuration validation.

Limitations:
- Docker image build was attempted but could not complete because containers could not resolve registry.npmjs.org (EAI_AGAIN), including with host networking. Base image download succeeded. No TLS or integrity checks were disabled. The Docker image itself has not been validated at runtime.
- Physical Android/iOS devices, Safari/WebKit, actual PWA installation, public DNS and HTTPS deployment were not tested here. Browser viewport tests are not substitutes for physical-device testing.
- No public deployment, native APK or IPA is included.

The source intentionally contains no school content and no active AI, messaging or live-class service.
