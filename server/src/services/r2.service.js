import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { r2Client } from "../config/r2.js";
import { env } from "../config/env.js";

// Presigned URL TTL in seconds (5 minutes)
const PRESIGNED_URL_TTL = 300;

/**
 * Generates a short-lived presigned PUT URL for direct browser → R2 upload.
 * The frontend uses this URL to PUT the file bytes directly to R2.
 * No file content ever passes through the backend.
 */
export const getR2PresignedUploadUrl = async (key, mimeType) => {
  const command = new PutObjectCommand({
    Bucket: env.r2.bucketName,
    Key: key,
    ContentType: mimeType,
  });

  return getSignedUrl(r2Client, command, { expiresIn: PRESIGNED_URL_TTL });
};

/**
 * Deletes an object from R2 by its key.
 * Silently succeeds if the key does not exist (R2 delete is idempotent).
 */
export const deleteR2File = async (key) => {
  if (!key) {
    return null;
  }

  return r2Client.send(
    new DeleteObjectCommand({
      Bucket: env.r2.bucketName,
      Key: key,
    }),
  );
};

/**
 * Generates a short-lived presigned URL for downloading a file.
 * Sets Content-Disposition: attachment so the browser saves the file.
 */
export const getR2PresignedDownloadUrl = async (key, filename) => {
  const command = new GetObjectCommand({
    Bucket: env.r2.bucketName,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
  });

  return getSignedUrl(r2Client, command, { expiresIn: PRESIGNED_URL_TTL });
};

/**
 * Generates a short-lived presigned URL for previewing a file inline.
 * No Content-Disposition override — browser decides how to handle it.
 */
export const getR2PresignedPreviewUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: env.r2.bucketName,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn: PRESIGNED_URL_TTL });
};
