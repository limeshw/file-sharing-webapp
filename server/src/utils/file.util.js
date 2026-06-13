import path from "node:path";
import { randomUUID } from "node:crypto";

import {
  ALLOWED_FILE_TYPES,
  BLOCKED_EXTENSIONS,
  EXPIRY_OPTIONS,
  MAX_FILE_SIZE,
} from "../constants/file.constants.js";

export const getFileExtension = (filename = "") =>
  path.extname(filename).toLowerCase();

export const sanitizeFilename = (filename = "") =>
  filename.replace(/[^a-zA-Z0-9._-]/g, "-");

export const isAllowedFile = ({ mimetype, originalname }) => {
  const extension = getFileExtension(originalname);

  if (!mimetype || !ALLOWED_FILE_TYPES[mimetype]) {
    return false;
  }

  if (BLOCKED_EXTENSIONS.includes(extension)) {
    return false;
  }

  return ALLOWED_FILE_TYPES[mimetype].includes(extension);
};

export const ensureFileUploadIsValid = (file) => {
  if (!file) {
    return "File is required.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File size exceeds 10MB limit.";
  }

  if (!isAllowedFile(file)) {
    return "Invalid file type. Allowed formats: PDF, images, documents, zip, and common code/text files.";
  }

  return null;
};

export const resolveExpiryDate = (expiryOption) => {
  const ttl = EXPIRY_OPTIONS[expiryOption];

  if (!ttl) {
    return null;
  }

  return new Date(Date.now() + ttl);
};

export const buildShareUrl = (baseUrl, uuid) => `${baseUrl}/files/${uuid}`;

export const createCloudinaryPublicId = (originalname) =>
  `${Date.now()}-${randomUUID()}-${sanitizeFilename(originalname)}`;

export const formatBytes = (bytes = 0) => {
  if (!bytes) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;

  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};
