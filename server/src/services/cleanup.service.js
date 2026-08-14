import { File } from "../models/file.model.js";

export const cleanupExpiredFiles = async () => {
  return File.find({
    expiresAt: { $lte: new Date() },
  })
    .select("_id uuid public_id")
    .lean();
};
