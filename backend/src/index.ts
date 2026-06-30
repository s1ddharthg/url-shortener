import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { generateId } from "./utils/index.js";
import { shortener } from "./db/schema.js";
import { db } from "./db/index.js";
import { eq } from "drizzle-orm";
import { clickQueue } from "./queues/clickQueue.js";

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

  await clickQueue.add(
    "track-click",
    {
      shortCode: code,
    }
  );

  return c.redirect(link[0].link);
});

const port = 3010;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});