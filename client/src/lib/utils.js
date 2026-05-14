import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes = 0) {
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
}

export function formatExpiry(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown expiry";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getTimeRemainingLabel(dateValue) {
  const target = new Date(dateValue).getTime();
  const diff = target - Date.now();

  if (Number.isNaN(target)) {
    return "Unavailable";
  }

  if (diff <= 0) {
    return "Expired";
  }

  const totalMinutes = Math.floor(diff / (1000 * 60));

  if (totalMinutes < 60) {
    return `${totalMinutes} min left`;
  }

  const totalHours = Math.floor(totalMinutes / 60);

  if (totalHours < 24) {
    return `${totalHours} hr left`;
  }

  const totalDays = Math.floor(totalHours / 24);
  return `${totalDays} day${totalDays === 1 ? "" : "s"} left`;
}

export function getErrorMessage(error, fallback = "Something went wrong.") {
  if (error?.message === "Network Error") {
    return "Network error: the browser could not reach the backend. If you are on local dev, this is usually a backend CORS issue or the backend URL is not reachable.";
  }

  return error?.response?.data?.message || error?.message || fallback;
}

export function isExpiredStatus(status) {
  return status === 410;
}
