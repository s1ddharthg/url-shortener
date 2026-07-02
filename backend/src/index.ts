import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { generateId } from "./utils/index.js";
import { clicks, shortener } from "./db/schema.js";
import { db } from "./db/index.js";
import { eq } from "drizzle-orm";
import { clickQueue } from "./queues/clickQueue.js";
import { rateLimit } from "./middleware/rateLimiter.js";

const app = new Hono();

app.onError((err, c) => {
  console.error("Hono encountered an error:", err);
  return c.json({ error: err.message, stack: err.stack }, 500);
});

import { cors } from "hono/cors";
import { encodeBase62 } from "./utils/base62.js";
import { redis } from "./db/redis.js";

app.use(
  "*",
  cors({
    origin: "http://localhost:3011",
  })
);

app.post("/api/shortener", async (c) => {
  const body = await c.req.json()
  const link = body.link
  const ip = c.req.header("x-forwarded-for") ?? "unknown";

  const allowed = await rateLimit(ip, 10);

  if (!allowed) {
    return c.json(
      {
        error:
          "Rate limit exceeded",
      },
      429
    );
  }

  const inserted = await db.insert(shortener).values({
    link,
    code: "temp"
  }).returning();

  const id = inserted[0].id;
  const code = encodeBase62(id);

  await db.update(shortener).set({ code, }).where(eq(shortener.id, id));

  return c.json({ code });
});

app.get("/:code", async (c) => {
  const code = c.req.param("code")

  const cached = await redis.get(code);

  if (cached) {
    return c.redirect(cached);
  }

  const link = await db.select().from(shortener).where(eq(shortener.code, code));

  if (link.length == 0) {
    return c.text("No link found")
  }

  await redis.set(code, link[0].link,
    {
      EX: 3600,
    }
  );

  const userAgent = c.req.header("user-agent");
  const ip = c.req.header("x-forwarded-for") ?? "unknown";

  await clickQueue.add(
    "track-click",
    {
      shortCode: code,
      ip,
      userAgent,
    }
  );

  return c.redirect(link[0].link);
});

app.get("/stats/:code", async (c) => {
  const code = c.req.param("code")

  const rows = await db.select().from(clicks).where(eq(clicks.shortCode, code));

  const totalClicks = rows.length;
  const uniqueVisitors = new Set(rows.map(row => row.ip)).size;
  const daily = rows.reduce(
    (acc, row) => {

      const day =
        row.clickedAt
          ?.toISOString()
          .split("T")[0];

      if (!day) return acc;

      acc[day] =
        (acc[day] ?? 0) + 1;

      return acc;

    },
    {} as Record<string, number>
  );

  const dailyClicks =
    Object.entries(daily).map(
      ([date, clicks]) => ({
        date,
        clicks,
      })
    );

  return c.json({
    totalClicks,
    uniqueVisitors,
    dailyClicks
  });

});

const port = Number(process.env.PORT) || 3010;

serve({
  fetch: app.fetch,
  port,
});