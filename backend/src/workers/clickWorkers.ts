import { Worker } from "bullmq";
import { db } from "../db/index.js";
import { clicks } from "../db/schema.js";
import { redisConnection } from "../queues/connection.js";

export function startClickWorker() {
  const worker = new Worker(
    "clicks",
    async (job) => {
      await db.insert(clicks).values({
        shortCode: job.data.shortCode,
        ip: job.data.ip,
        userAgent: job.data.userAgent,
      });
    },
    {
      connection: redisConnection,
    }
  );

  worker.on("error", (err) => console.error("Click worker error:", err));

  return worker;
}