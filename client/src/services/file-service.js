import { FILE_INPUT_NAME } from "../lib/constants.js";
import { api, buildBackendUrl } from "./api.js";

export async function uploadFile(payload, onUploadProgress) {
  const formData = new FormData();
  formData.append(FILE_INPUT_NAME, payload.file);
  formData.append("expiry", payload.expiry);

  if (payload.password) {
    formData.append("password", payload.password);
  }

  const response = await api.post("/api/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return response.data;
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
  
  const response = await api.get(url, {
    responseType: 'blob',
    onDownloadProgress: onProgress
  });

  const blob = response.data;
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = filename || "download";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
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
