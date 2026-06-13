import { HTTP_STATUS } from "../constants/http.constants.js";
import { AppError } from "../utils/appError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createFileRecord,
  sendShareEmail,
  verifyFilePassword,
} from "../services/file.service.js";
import { ensureFileUploadIsValid } from "../utils/file.util.js";
import {
  validateEmailPayload,
  validatePasswordPayload,
  validateUploadPayload,
} from "../validators/file.validator.js";

export const uploadFile = asyncHandler(async (req, res) => {
  validateUploadPayload(req.body);
  const uploadValidationError = ensureFileUploadIsValid(req.file);

  if (uploadValidationError) {
    throw new AppError(uploadValidationError, HTTP_STATUS.BAD_REQUEST);
  }

  const { file, shareUrl } = await createFileRecord({
    file: req.file,
    expiry: req.body.expiry,
    password: req.body.password,
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

export const shareFileByEmail = asyncHandler(async (req, res) => {
  validateEmailPayload(req.body);

  await sendShareEmail(req.body);

  sendSuccess(res, HTTP_STATUS.OK, "Share email sent successfully");
});
