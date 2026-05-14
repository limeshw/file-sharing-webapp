import cron from "node-cron";

import { cleanupExpiredFiles } from "../services/cleanup.service.js";

export const startCleanupCron = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      const result = await cleanupExpiredFiles();
      if (result.deletedCount > 0) {
        console.log(`Cleanup completed. Deleted ${result.deletedCount} expired file(s).`);
      }
    } catch (error) {
      console.error("Cleanup cron failed", error);
    }
  });
};
