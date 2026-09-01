import path from "node:path";
import express from "express";
import { createServer as createViteServer } from "vite";
import app from "./artifacts/api-server/src/app";
import { logger } from "./artifacts/api-server/src/lib/logger";

const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      configFile: path.resolve(process.cwd(), "artifacts/web/vite.config.ts"),
      server: {
        middlewareMode: true,
      },
      appType: "spa",
      root: path.resolve(process.cwd(), "artifacts/web"),
    });

    app.use(vite.middlewares);
  } else {
    const clientDist = path.resolve(process.cwd(), "artifacts/web/dist/public");
    app.use(express.static(clientDist));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    logger.info({ port: PORT }, `Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
