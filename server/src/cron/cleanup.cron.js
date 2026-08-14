import cron from "node-cron";
import { cleanupExpiredFiles } from "../services/cleanup.service.js";
import { expiryQueue } from "../queues/expiry.queue.js";

export const startCleanupCron = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      const expiredFiles = await cleanupExpiredFiles();
      if (!expiredFiles.length) {
        return;
      }

      console.log(`[Cleanup Cron] Found ${expiredFiles.length} expired file(s). Queueing for deletion...`);

      let queuedCount = 0;
      let failedCount = 0;

      for (const file of expiredFiles) {
        try {
          await expiryQueue.add(
            "expire-file",
            {
              mongoId: file._id.toString(),
              uuid: file.uuid,
              public_id: file.public_id,
            },
            {
              jobId: file.uuid,
            }
          );
          queuedCount++;
        } catch (error) {
          console.error(`[Cleanup Cron] Failed to enqueue expiry job for file ${file.uuid}:`, error);
          failedCount++;
        }
      }

      console.log(
        `[Cleanup Cron] Processing complete. Total found: ${expiredFiles.length}, Successfully queued: ${queuedCount}, Failed to queue: ${failedCount}`
      );
    } catch (error) {
      console.error("Cleanup cron failed", error);
    }
  });
};
