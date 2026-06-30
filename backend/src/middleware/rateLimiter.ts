import { redis } from "../db/redis.js";

export async function rateLimit(
    ip: string,
    limit = 10
) {
    const key = `rate:${ip}`;

    const count =
        await redis.incr(key);

    if (count === 1) {
        await redis.expire(
            key,
            60
        );
    }

    return count <= limit;
}