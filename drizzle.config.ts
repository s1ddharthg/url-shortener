import { defineConfig } from "drizzle-kit";
import { env } from "process";

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: `postgres://postgres:${process.env.DB_PASSWORD}@127.0.0.1:5432/url-shortener`,
    },
});