import dotenv from "dotenv";

dotenv.config();

const requiredVariables = [
  "MONGO_CONNECTION_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "APP_BASE_URL",
];

const requiredSmtpVariables = [
  "SMTP_HOST",
  "MAIL_USER",
  "MAIL_PASSWORD",
  "MAIL_FROM_NAME",
  "MAIL_FROM_EMAIL",
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

if (process.env.NODE_ENV === "production") {
  for (const variable of requiredSmtpVariables) {
    if (!process.env[variable]) {
      throw new Error(`Missing required environment variable: ${variable}`);
    }
  }
}

const fallbackAppSecret = "linkify-dev-secret-change-me";

if (!process.env.APP_SECRET && process.env.NODE_ENV !== "production") {
  console.warn(
    "APP_SECRET is not set. Falling back to a development secret. Set APP_SECRET in .env before production deployment.",
  );
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  host: process.env.HOST || "localhost",
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGO_CONNECTION_URL,
  appBaseUrl: process.env.APP_BASE_URL,
  frontendBaseUrl: process.env.FRONTEND_BASE_URL || process.env.APP_BASE_URL,
  appSecret:
    process.env.APP_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : fallbackAppSecret),
  uploadFolder: process.env.CLOUDINARY_FOLDER || "linkify/files",
  allowedClients: (process.env.ALLOWED_CLIENTS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jsonLimit: process.env.JSON_LIMIT || "1mb",
  uploadRateLimitMax: Number(process.env.UPLOAD_RATE_LIMIT_MAX || 20),
  shareRateLimitMax: Number(process.env.SHARE_RATE_LIMIT_MAX || 60),
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
    fromName: process.env.MAIL_FROM_NAME,
    fromEmail: process.env.MAIL_FROM_EMAIL,
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 10000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 15000),
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

if (env.nodeEnv === "production" && !env.appSecret) {
  throw new Error("Missing required environment variable: APP_SECRET");
}
