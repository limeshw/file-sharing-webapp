import { EXPIRY_OPTIONS, MAX_FILE_SIZE } from "../constants/file.constants.js";
import { HTTP_STATUS } from "../constants/http.constants.js";
import { AppError } from "../utils/appError.js";
import { isAllowedFile } from "../utils/file.util.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates the JSON metadata sent before a presigned PUT URL is issued.
 * All upload validation runs here — before any URL is generated.
 */
export const validatePrepareUploadPayload = ({ filename, mimeType, size, expiry, password }) => {
  if (!filename || typeof filename !== "string" || !filename.trim()) {
    throw new AppError("filename is required.", HTTP_STATUS.BAD_REQUEST);
  }

  if (!mimeType || typeof mimeType !== "string") {
    throw new AppError("mimeType is required.", HTTP_STATUS.BAD_REQUEST);
  }

  if (!isAllowedFile({ mimetype: mimeType, originalname: filename })) {
    throw new AppError(
      "Invalid file type. Allowed formats: PDF, images, documents, zip, and common code/text files.",
      HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE,
    );
  }

  if (typeof size !== "number" || size <= 0) {
    throw new AppError("size must be a positive number.", HTTP_STATUS.BAD_REQUEST);
  }

  if (size > MAX_FILE_SIZE) {
    throw new AppError(
      `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`,
      HTTP_STATUS.PAYLOAD_TOO_LARGE,
    );
  }

  if (!expiry || !EXPIRY_OPTIONS[expiry]) {
    throw new AppError(
      "Invalid expiry selection. Allowed values are 1h, 24h, or 7d.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (password && String(password).length < 6) {
    throw new AppError(
      "Password must be at least 6 characters long.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

/**
 * Validates the confirm-upload payload after the browser has PUT the file to R2.
 * Re-validates all metadata to prevent forged confirm requests.
 */
export const validateConfirmUploadPayload = ({ key, filename, mimeType, size, expiry, password }) => {
  if (!key || typeof key !== "string" || !key.trim()) {
    throw new AppError("key is required.", HTTP_STATUS.BAD_REQUEST);
  }

  validatePrepareUploadPayload({ filename, mimeType, size, expiry, password });
};

export const validateUuid = (uuid) => {
  if (!uuid || !UUID_REGEX.test(uuid)) {
    throw new AppError("Invalid file identifier.", HTTP_STATUS.BAD_REQUEST);
  }
};

export const validatePasswordPayload = ({ uuid, password }) => {
  validateUuid(uuid);

  if (!password) {
    throw new AppError("Password is required.", HTTP_STATUS.BAD_REQUEST);
  }
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmailPayload = ({ uuid, emailTo, emailFrom }) => {
  validateUuid(uuid);

  if (!emailTo || !emailFrom) {
    throw new AppError(
      "uuid, emailTo, and emailFrom are required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (!EMAIL_REGEX.test(emailTo) || !EMAIL_REGEX.test(emailFrom)) {
    throw new AppError(
      "Valid email addresses are required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};
