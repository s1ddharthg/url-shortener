import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { env } from "process";

const queryClient = postgres(
    process.env.DATABASE_URL!
);
export const db = drizzle(queryClient, { schema });