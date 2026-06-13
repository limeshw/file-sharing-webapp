import { Readable } from "node:stream";

import cloudinary from "../config/cloudinary.js";
import { env } from "../config/env.js";
import { createCloudinaryPublicId } from "../utils/file.util.js";

export const uploadLocalFileToCloudinary = async (file) => {
  const publicId = createCloudinaryPublicId(file.originalname);

  return cloudinary.uploader.upload(file.path, {
    folder: env.uploadFolder,
    public_id: publicId,
    resource_type: "auto",
    use_filename: false,
    unique_filename: false,
    overwrite: false,
  });
};

export const deleteCloudinaryFile = async (publicId, resourceType = "raw") => {
  if (!publicId) {
    return null;
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
};
