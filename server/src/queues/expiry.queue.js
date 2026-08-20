import { Queue } from "bullmq";
import { createBullMQConnection } from "../config/bullmq.js";

export const expiryQueue = new Queue("file-expiry", {
  connection: createBullMQConnection("producer"),
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      count: 100,
    },
    removeOnFail: {
      count: 200,
    },
  },
});

expiryQueue.on("error", (error) => {
  console.error("Expiry queue connection error:", error);
});
