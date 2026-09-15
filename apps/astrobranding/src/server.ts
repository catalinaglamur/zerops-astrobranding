import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "astrobranding",
    uptime: process.uptime()
  });
});

app.get("/", (c) => {
  return c.json({
    name: "Zerops AstroBranding Sovereign Platform",
    status: "active",
    healthCheck: "/health"
  });
});

const port = Number(process.env.PORT || 3000);
console.log(`[AstroBranding] Sovereign server running on port ${port}`);

export default {
  port,
  fetch: app.fetch
};
