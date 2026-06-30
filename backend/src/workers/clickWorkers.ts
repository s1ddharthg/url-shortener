import { Worker } from "bullmq";
import { db } from "../db/index.js";
import { clicks } from "../db/schema.js";

new Worker(
    "clicks",

    async (job) => {
        await db.insert(clicks).values({ shortCode: job.data.shortCode, });

        console.log("Tracked click:", job.data.shortCode);
    },
    {
        connection: {
            host: "localhost",
            port: 6379,
        },
    }
);