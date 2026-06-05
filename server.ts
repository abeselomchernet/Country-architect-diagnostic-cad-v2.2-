import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON middleware
  app.use(express.json());

  // API routes go here FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Simple in-memory storage for assessments
  const assessments: Record<string, any> = {};

  app.get("/api/assessments", (req, res) => {
    res.json(Object.keys(assessments));
  });

  app.post("/api/assessments", (req, res) => {
    const { id, data } = req.body;
    assessments[id] = data;
    res.json({ success: true });
  });

  app.get("/api/assessments/:id", (req, res) => {
    const { id } = req.params;
    if (assessments[id]) {
      res.json(assessments[id]);
    } else {
      res.status(404).json({ error: "Assessment not found" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
