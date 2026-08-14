import { Worker } from "bullmq";
import { File } from "../models/file.model.js";
import { deleteR2File } from "../services/r2.service.js";
import { invalidateFileCache } from "../services/cache.service.js";
import { createBullMQConnection } from "../config/bullmq.js";

export const expiryWorker = new Worker(
  "file-expiry",
  async (job) => {
    const { mongoId, uuid, public_id } = job.data;

    // 1. Delete from R2
    // Failure here must fail the entire job so BullMQ retries it.
    await deleteR2File(public_id);

    // 2. Delete MongoDB record
    // Failure here must also fail the job so BullMQ retries it.
    await File.deleteOne({
      _id: mongoId,
    });

    // 3. Invalidate Redis cache
    // Cache failure must NOT cause the already-completed deletion to be retried.
    try {
      await invalidateFileCache(uuid);
    } catch (error) {
      console.error(
        `Cache invalidation failed for expired file ${uuid}:`,
        error
      );
    }

    console.log(`Expired file deleted successfully: ${uuid}`);
  },
  {
    connection: createBullMQConnection("worker"),
    concurrency: 3,
  }
);

expiryWorker.on("failed", (job, error) => {
  console.error(
    `Expiry job failed: ${job?.id}, attempt ${job?.attemptsMade}`,
    error
  );
});

export default expiryWorker;
