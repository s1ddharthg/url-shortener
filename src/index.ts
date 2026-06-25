import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { generateId } from "./utils/index.js";
import { shortener } from "./db/schema.js";
import { db } from "./db/index.js";
import { eq } from "drizzle-orm";

const app = new Hono();

app.post("/api/shortener", async (c) => {
  const body = await c.req.json()
  const link = body.link
  const code = generateId(6)

  await db.insert(shortener).values({
    id: generateId(8),
    link,
    code,
  });

  return c.json({ code });
});

app.get("/:code", async (c) => {
  const code = c.req.param("code")
  const link = await db.select().from(shortener).where(eq(shortener.code, code));

  if (link.length == 0) {
    return c.text("No link found")
  }

  return c.redirect(link[0].link);
});

const port = 3010;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});