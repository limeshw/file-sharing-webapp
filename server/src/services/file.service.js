import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";

import { env } from "../config/env.js";
import { EXPIRY_LABELS } from "../constants/file.constants.js";
import { HTTP_STATUS } from "../constants/http.constants.js";
import { File } from "../models/file.model.js";
import { AppError } from "../utils/appError.js";
import { buildShareUrl, formatBytes, resolveExpiryDate } from "../utils/file.util.js";
import { createDownloadAccessKey, verifyDownloadAccessKey } from "../utils/token.util.js";
import { deleteR2File } from "./r2.service.js";
import { sendFileShareEmail } from "./email.service.js";
import { getFileCache, setFileCache, invalidateFileCache } from "./cache.service.js";

const SALT_ROUNDS = 10;

const ensureActiveFile = (file) => {
  if (!file) {
    throw new AppError("File not found.", HTTP_STATUS.NOT_FOUND);
  }

  if (file.expiresAt <= new Date()) {
    throw new AppError("Link Expired", HTTP_STATUS.GONE);
  }

  return file;
};

/**
 * Creates a MongoDB file record for a file already uploaded directly to R2.
 * Called by confirmUpload after the browser has PUT the file to R2.
 */
export const createFileRecordFromKey = async ({ key, filename, mimeType, size, expiry, password }) => {
  const uuid = randomUUID();
  const shareUrl = buildShareUrl(env.frontendBaseUrl, uuid);

  const hashedPassword = password
    ? await bcrypt.hash(String(password), SALT_ROUNDS)
    : null;

  const createdFile = await File.create({
    filename,
    originalName: filename,
    uuid,
    url: key,
    public_id: key,
    resourceType: "raw",
    size,
    mimeType,
    password: hashedPassword,
    hasPassword: Boolean(hashedPassword),
    expiryOption: expiry,
    expiresAt: resolveExpiryDate(expiry),
  });

  return { file: createdFile, shareUrl };
};

export const getFileByUuid = async (uuid) => {
  const cachedFile = await getFileCache(uuid);
  if (cachedFile) {
    return ensureActiveFile(cachedFile);
  }

  const file = await File.findOne({ uuid });
  if (file) {
    await setFileCache(uuid, file.toObject());
  }

  return ensureActiveFile(file);
};

export const buildFileViewModel = (file) => ({
  uuid: file.uuid,
  fileName: file.originalName,
  fileSize: formatBytes(file.size),
  downloadLink: `${env.appBaseUrl}/files/download/${file.uuid}`,
  expiresAt: file.expiresAt,
  expiryLabel: EXPIRY_LABELS[file.expiryOption] || "custom expiry",
  hasPassword: file.hasPassword,
  downloadCount: file.downloadCount,
  mimeType: file.mimeType,
});

export const verifyFilePassword = async ({ uuid, password }) => {
  const file = await getFileByUuid(uuid);

  if (!file.hasPassword || !file.password) {
    throw new AppError(
      "This file does not require password verification.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const isPasswordValid = await bcrypt.compare(String(password), file.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid password.", HTTP_STATUS.UNAUTHORIZED);
  }

  return {
    file,
    accessKey: createDownloadAccessKey(uuid),
  };
};

export const resolveDownload = async ({ uuid, accessKey }) => {
  const file = await getFileByUuid(uuid);

  if (file.hasPassword && !verifyDownloadAccessKey(accessKey, uuid)) {
    throw new AppError(
      "Password verification required before download.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  const updatedFile = await File.findOneAndUpdate(
    { uuid },
    { $inc: { downloadCount: 1 } },
    { new: true }
  );

  if (!updatedFile) {
    throw new AppError("File not found.", HTTP_STATUS.NOT_FOUND);
  }

  await invalidateFileCache(uuid);

  return updatedFile;
};

export const resolvePreview = async ({ uuid, accessKey }) => {
  const file = await getFileByUuid(uuid);

  if (file.hasPassword && !verifyDownloadAccessKey(accessKey, uuid)) {
    throw new AppError(
      "Password verification required before preview.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  return file;
};

export const sendShareEmail = async ({ uuid, emailTo, emailFrom }) => {
  const file = await getFileByUuid(uuid);

  const downloadLink = buildShareUrl(env.frontendBaseUrl, file.uuid);

  const updatedFile = await File.findOneAndUpdate(
    { uuid },
    { sender: emailFrom, receiver: emailTo },
    { new: true }
  );

  if (!updatedFile) {
    throw new AppError("File not found.", HTTP_STATUS.NOT_FOUND);
  }

  await invalidateFileCache(uuid);

  await sendFileShareEmail({
    to: emailTo,
    emailFrom,
    fileName: updatedFile.originalName,
    fileSize: formatBytes(updatedFile.size),
    downloadLink,
    expires: EXPIRY_LABELS[updatedFile.expiryOption] || "selected duration",
  });

  return updatedFile;
};

export const deleteExpiredFileRecord = async (file) => {
  try {
    await deleteR2File(file.public_id);
  } catch (error) {
    console.error(`Failed to delete R2 file ${file.public_id}`, error);
  }

  await File.deleteOne({ _id: file._id });
  await invalidateFileCache(file.uuid);
};
