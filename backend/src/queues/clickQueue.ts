import { Queue } from "bullmq";
import { redisConnection } from "./connection.js";

export const clickQueue =
    new Queue(
        "clicks",
        {
            connection: redisConnection,
        }
    );