import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.post("/api/shortener", async (c) => {
  // create shortener route
  return c.text("Not yet implemented");
});

app.get("/:code", async (c) => {
  // redirect
  return c.text("Not yet implemented");
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});