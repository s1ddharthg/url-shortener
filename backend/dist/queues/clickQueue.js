import { Queue } from "bullmq";
export const clickQueue = new Queue("clicks", {
    connection: (process.env.REDIS_URL ? process.env.REDIS_URL : {
        host: "localhost",
        port: 6379,
    }),
});
