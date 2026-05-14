import { Readable } from "node:stream";

import cloudinary from "../config/cloudinary.js";
import { env } from "../config/env.js";
import { createCloudinaryPublicId } from "../utils/file.util.js";

export const uploadBufferToCloudinary = async (file) =>
  new Promise((resolve, reject) => {
    const publicId = createCloudinaryPublicId(file.originalname);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: env.uploadFolder,
        public_id: publicId,
        resource_type: "auto",
        use_filename: false,
        unique_filename: false,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });

export const deleteCloudinaryFile = async (publicId, resourceType = "raw") => {
  if (!publicId) {
    return null;
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
};
