import { Queue } from "bullmq";
export const clickQueue = new Queue("clicks", {
    connection: {
        host: "localhost",
        port: 6379,
    },
});
