import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
export const categoryIds = [
  "homework",
  "timetable",
  "tutor",
  "classes",
  "planner",
  "teachers",
  "exams",
  "announcements",
];
export function createApp({ production = false } = {}) {
  const app = express();
  app.disable("x-powered-by");
  // Never let private dotfiles fall through to static serving or SPA routing.
  app.use((req, res, next) => {
    if (req.path.split("/").some((segment) => segment.startsWith("."))) {
      return res.status(404).end();
    }
    next();
  });
  app.use(
    helmet({
      contentSecurityPolicy: production
        ? {
            directives: {
              "script-src": ["'self'"],
              "media-src": ["'self'"],
              "img-src": ["'self'", "data:"],
              "connect-src": ["'self'"],
              "upgrade-insecure-requests": null,
            },
          }
        : false,
      strictTransportSecurity: production ? undefined : false,
    }),
  );
  app.get("/api/health", (_req, res) => {
    res
      .set("Cache-Control", "no-store")
      .json({ status: "ok", service: "baghdadia-school" });
  });
  app.get("/api/categories", (_req, res) =>
    res.json({
      categories: categoryIds.map((id) => ({ id, items: [], status: "empty" })),
      aiEnabled: false,
    }),
  );
  app.use("/api", (_req, res) => res.status(404).json({ error: "NOT_FOUND" }));
  if (production) {
    const dist = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../dist",
    );
    app.use(
      express.static(dist, {
        setHeaders(res, file) {
          res.setHeader(
            "Cache-Control",
            file.includes("/assets/") && !file.endsWith(".mp4")
              ? "public, max-age=3600"
              : "no-cache",
          );
        },
      }),
    );
    app.get("/{*path}", (req, res, next) => {
      if (path.extname(req.path)) return res.status(404).end();
      res
        .set("Cache-Control", "no-cache")
        .sendFile(path.join(dist, "index.html"));
    });
  }
  app.use((err, _req, res, _next) => {
    console.error(err.message);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  });
  return app;
}
