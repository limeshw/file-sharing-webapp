import { File } from "../models/file.model.js";
import { deleteExpiredFileRecord } from "./file.service.js";

export const cleanupExpiredFiles = async () => {
  const expiredFiles = await File.find({
    expiresAt: { $lte: new Date() },
  }).lean(false);

  if (!expiredFiles.length) {
    return {
      deletedCount: 0,
    };
  }

  for (const file of expiredFiles) {
    await deleteExpiredFileRecord(file);
  }

  return {
    deletedCount: expiredFiles.length,
  };
};
