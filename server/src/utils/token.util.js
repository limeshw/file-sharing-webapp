import crypto from "node:crypto";

import { env } from "../config/env.js";

const toBase64Url = (value) => Buffer.from(value).toString("base64url");
const fromBase64Url = (value) => Buffer.from(value, "base64url").toString("utf8");

export const createDownloadAccessKey = (uuid, ttlMs = 10 * 60 * 1000) => {
  const payload = JSON.stringify({
    uuid,
    expiresAt: Date.now() + ttlMs,
  });

  const encodedPayload = toBase64Url(payload);
  const signature = crypto
    .createHmac("sha256", env.appSecret)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
};

export const verifyDownloadAccessKey = (token, uuid) => {
  if (!token || !token.includes(".")) {
    return false;
  }

  const [encodedPayload, signature] = token.split(".");
  const expectedSignature = crypto
    .createHmac("sha256", env.appSecret)
    .update(encodedPayload)
    .digest("base64url");

  if (signature !== expectedSignature) {
    return false;
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload));

  return payload.uuid === uuid && payload.expiresAt > Date.now();
};
