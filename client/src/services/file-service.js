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

export function buildFrontendSharePath(uuid) {
  return `${window.location.origin}/files/${uuid}`;
}

export function buildDownloadPath(uuid, accessKey) {
  const url = new URL(buildBackendUrl(`/files/download/${uuid}`));

  if (accessKey) {
    url.searchParams.set("accessKey", accessKey);
  }

  return url.toString();
}
