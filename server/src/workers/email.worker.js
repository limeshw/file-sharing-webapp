import { Worker } from "bullmq";
import { sendFileShareEmail } from "../services/email.service.js";
import { createBullMQConnection } from "../config/bullmq.js";

export const emailWorker = new Worker(
  "email",
  async (job) => {
    await sendFileShareEmail(job.data);
  },
  {
    connection: createBullMQConnection("worker"),
    concurrency: 5,
  }
);

emailWorker.on("failed", (job, error) => {
  console.error(
    `Email job failed: ${job?.id}, attempt ${job?.attemptsMade}`,
    error
  );
});

export default emailWorker;
