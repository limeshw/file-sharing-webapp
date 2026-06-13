import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";

import { env } from "../config/env.js";
import { EXPIRY_LABELS } from "../constants/file.constants.js";
import { HTTP_STATUS } from "../constants/http.constants.js";
import { File } from "../models/file.model.js";
import { AppError } from "../utils/appError.js";
import { buildShareUrl, formatBytes, resolveExpiryDate } from "../utils/file.util.js";
import { createDownloadAccessKey, verifyDownloadAccessKey } from "../utils/token.util.js";
import { unlink } from "node:fs/promises";
import { deleteCloudinaryFile, uploadLocalFileToCloudinary } from "./cloudinary.service.js";
import { sendFileShareEmail } from "./email.service.js";

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

export const createFileRecord = async ({ file, expiry, password }) => {
  const uuid = randomUUID();
  const shareUrl = buildShareUrl(env.frontendBaseUrl, uuid);

  const hashedPassword = password
    ? await bcrypt.hash(String(password), SALT_ROUNDS)
    : null;
  const uploadedAsset = await uploadLocalFileToCloudinary(file);

  try {
    await unlink(file.path);
  } catch (error) {
    console.error(`Failed to delete local temp file at ${file.path}`, error);
  }

  const createdFile = await File.create({
    filename: uploadedAsset.display_name || file.originalname,
    originalName: file.originalname,
    uuid,
    url: uploadedAsset.secure_url,
    public_id: uploadedAsset.public_id,
    resourceType: uploadedAsset.resource_type,
    size: file.size,
    mimeType: file.mimetype,
    password: hashedPassword,
    hasPassword: Boolean(hashedPassword),
    expiryOption: expiry,
    expiresAt: resolveExpiryDate(expiry),
  });

  return {
    file: createdFile,
    shareUrl,
  };
};

export const getFileByUuid = async (uuid) => {
  const file = await File.findOne({ uuid });
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

  file.downloadCount += 1;
  await file.save();

  return file;
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

  // Update sender/receiver each time (allows re-sharing to different emails)
  file.sender = emailFrom;
  file.receiver = emailTo;
  await file.save();

  await sendFileShareEmail({
    to: emailTo,
    emailFrom,
    fileName: file.originalName,
    fileSize: formatBytes(file.size),
    downloadLink,
    expires: EXPIRY_LABELS[file.expiryOption] || "selected duration",
  });

  return file;
};

export const deleteExpiredFileRecord = async (file) => {
  try {
    await deleteCloudinaryFile(file.public_id, file.resourceType);
  } catch (error) {
    console.error(`Failed to delete Cloudinary file ${file.public_id}`, error);
  }

  await File.deleteOne({ _id: file._id });
};
