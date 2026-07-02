import { createClient } from "redis";

if (!process.env.REDIS_URL) {
    throw new Error("Missing REDIS_URL environment variable");
}

export const redis = createClient({
    url: process.env.REDIS_URL,
});

redis.on("error", (err) => console.error("Redis client error:", err));

await redis.connect();