import { createApp } from "./app.js";
const port = Number(process.env.PORT || 3001);
const server = createApp({
  production:
    process.argv.includes("--production") ||
    process.env.NODE_ENV === "production",
}).listen(port, process.env.HOST || "0.0.0.0", () =>
  console.log(`Baghdadia School listening on port ${port}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
