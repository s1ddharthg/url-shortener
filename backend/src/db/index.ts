import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { env } from "process";

const queryClient = postgres(
    `postgres://postgres:${env.DB_PASSWORD}@127.0.0.1:5432/url-shortener`
);
export const db = drizzle(queryClient, { schema });