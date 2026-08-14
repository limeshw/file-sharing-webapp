import { Queue } from "bullmq";
import { createBullMQConnection } from "../config/bullmq.js";

export const emailQueue = new Queue("email", {
  connection: createBullMQConnection("producer"),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      count: 50,
    },
    removeOnFail: {
      count: 100,
    },
  },
});
