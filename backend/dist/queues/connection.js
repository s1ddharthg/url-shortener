export const redisConnection = (process.env.REDIS_URL ? process.env.REDIS_URL : {
    host: "localhost",
    port: 6379,
});
