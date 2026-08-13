import { HTTP_STATUS } from "../constants/http.constants.js";
import { AppError } from "../utils/appError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createFileRecordFromKey,
  sendShareEmail,
  verifyFilePassword,
} from "../services/file.service.js";
import { getR2PresignedUploadUrl } from "../services/r2.service.js";
import { createR2ObjectKey } from "../utils/file.util.js";
import {
  validateConfirmUploadPayload,
  validateEmailPayload,
  validatePasswordPayload,
  validatePrepareUploadPayload,
} from "../validators/file.validator.js";

// Presigned PUT URL TTL exposed to the frontend so it can show a deadline.
const UPLOAD_URL_TTL = 300;

/**
 * Step 1 of the upload flow.
 * Validates file metadata, generates an R2 object key and a presigned PUT URL.
 * The frontend uses the URL to PUT the file directly to R2.
 * No file bytes pass through this server.
 */
export const prepareUpload = asyncHandler(async (req, res) => {
  const { filename, mimeType, size, expiry, password } = req.body;

  validatePrepareUploadPayload({ filename, mimeType, size: Number(size), expiry, password });

  const key = createR2ObjectKey(filename);
  const uploadUrl = await getR2PresignedUploadUrl(key, mimeType);

  sendSuccess(res, HTTP_STATUS.OK, "Upload URL generated", {
    uploadUrl,
    key,
    expiresIn: UPLOAD_URL_TTL,
  });
});

/**
 * Step 2 of the upload flow.
 * Called after the frontend has successfully PUT the file to R2.
 * Creates the MongoDB file record and returns the share link.
 * Response shape is identical to the old single-step upload endpoint.
 */
export const confirmUpload = asyncHandler(async (req, res) => {
  const { key, filename, mimeType, size, expiry, password } = req.body;

  validateConfirmUploadPayload({ key, filename, mimeType, size: Number(size), expiry, password });

  const { file, shareUrl } = await createFileRecordFromKey({
    key,
    filename,
    mimeType,
    size: Number(size),
    expiry,
    password,
  });

  sendSuccess(res, HTTP_STATUS.CREATED, "File uploaded successfully", {
    uuid: file.uuid,
    shareUrl,
    downloadPageUrl: shareUrl,
    downloadUrl: `${shareUrl.replace("/files/", "/files/download/")}`,
    expiresAt: file.expiresAt,
    hasPassword: file.hasPassword,
    originalName: file.originalName,
    size: file.size,
    mimeType: file.mimeType,
  });
});

export const verifyPassword = asyncHandler(async (req, res) => {
  validatePasswordPayload(req.body);

  const { file, accessKey } = await verifyFilePassword(req.body);

  sendSuccess(res, HTTP_STATUS.OK, "Password verified successfully", {
    uuid: file.uuid,
    downloadUrl: `${req.protocol}://${req.get("host")}/files/download/${file.uuid}?accessKey=${accessKey}`,
    accessKey,
  });
});

// Sends a file-sharing email via the Brevo REST API service.
// Returns a JSON success or failure response to the frontend.
export const shareFileByEmail = asyncHandler(async (req, res) => {
  validateEmailPayload(req.body);

  await sendShareEmail(req.body);

  sendSuccess(res, HTTP_STATUS.OK, "Share email sent successfully");
});
