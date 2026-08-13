import axios from "axios";
import { api, buildBackendUrl } from "./api.js";

/**
 * Phase 2 upload flow:
 *   1. POST metadata → backend returns presigned R2 PUT URL + key
 *   2. PUT file bytes directly to R2 (progress reported here)
 *   3. POST key + metadata → backend creates MongoDB record, returns share link
 *
 * The function signature is identical to the Phase 1 version so upload-form.jsx
 * requires no changes.
 */
export async function uploadFile(payload, onUploadProgress) {
  // Step 1 — Get presigned PUT URL from backend
  const prepareRes = await api.post("/api/files/prepare-upload", {
    filename: payload.file.name,
    mimeType: payload.file.type,
    size: payload.file.size,
    expiry: payload.expiry,
    ...(payload.password ? { password: payload.password } : {}),
  });

  const { uploadUrl, key } = prepareRes.data.data;

  // Step 2 — PUT file directly to R2 (bypasses backend, real progress events)
  await axios.put(uploadUrl, payload.file, {
    headers: { "Content-Type": payload.file.type },
    onUploadProgress,
  });

  // Step 3 — Tell backend to create the MongoDB record
  const confirmRes = await api.post("/api/files/confirm-upload", {
    key,
    filename: payload.file.name,
    mimeType: payload.file.type,
    size: payload.file.size,
    expiry: payload.expiry,
    ...(payload.password ? { password: payload.password } : {}),
  });

  return confirmRes.data;
}

export async function fetchFileMeta(uuid) {
  const response = await api.get(`/files/meta/${uuid}`);
  return response.data;
}

export async function verifyFilePassword(payload) {
  const response = await api.post("/api/files/verify-password", payload);
  return response.data;
}

export async function sendShareEmail(payload) {
  const response = await api.post("/api/files/send", payload);
  return response.data;
}

export async function downloadFileToDevice({ uuid, accessKey, filename }, onProgress) {
  const url = buildDownloadPath(uuid, accessKey);

  // Get the presigned R2 URL from the backend (JSON response)
  const response = await api.get(url);
  const presignedUrl = response.data?.data?.downloadUrl;

  if (!presignedUrl) {
    throw new Error("Failed to get download URL from server.");
  }

  // Trigger a direct browser navigation — not an XHR request.
  // This bypasses CORS entirely since browser navigations are not subject to CORS.
  const anchor = document.createElement("a");
  anchor.href = presignedUrl;
  anchor.download = filename || "download";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function buildFrontendSharePath(uuid) {
  return `${window.location.origin}/files/${uuid}`;
}

export function buildDownloadPath(uuid, accessKey) {
  // In dev mode, buildBackendUrl returns a relative path like "/files/download/uuid"
  // because API_BASE_URL is "" (Vite proxy handles it). new URL() requires an absolute
  // URL string, so we pass window.location.href as the base to resolve relative paths.
  const url = new URL(buildBackendUrl(`/files/download/${uuid}`), window.location.href);

  if (accessKey) {
    url.searchParams.set("accessKey", accessKey);
  }

  return url.toString();
}

export function buildPreviewPath(uuid, accessKey) {
  const url = new URL(buildBackendUrl(`/files/preview/${uuid}`), window.location.href);

  if (accessKey) {
    url.searchParams.set("accessKey", accessKey);
  }

  return url.toString();
}
