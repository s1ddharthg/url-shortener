import { Worker } from "bullmq";
import { db } from "../db/index.js";
import { clicks } from "../db/schema.js";
new Worker("clicks", async (job) => {
    await db.insert(clicks).values({
        shortCode: job.data.shortCode,
        ip: job.data.ip,
        userAgent: job.data.userAgent,
    });
    console.log("Tracked click:", job.data.shortCode);
}, {
    connection: (process.env.REDIS_URL ? process.env.REDIS_URL : {
        host: "localhost",
        port: 6379,
    }),
});
