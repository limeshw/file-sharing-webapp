import emailWorker from "./email.worker.js";
import expiryWorker from "./expiry.worker.js";
import { emailQueue } from "../queues/email.queue.js";
import { expiryQueue } from "../queues/expiry.queue.js";

export const startAllWorkers = () => {
  console.log("BullMQ Workers started successfully.");
};

export const closeAllWorkers = async () => {
  console.log("Closing BullMQ Workers and Queues...");

  await Promise.all([
    emailWorker.close(),
    expiryWorker.close(),
    emailQueue.close(),
    expiryQueue.close(),
  ]);

  console.log("BullMQ Workers and Queues closed.");
};