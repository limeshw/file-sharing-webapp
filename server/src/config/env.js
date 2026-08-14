import dotenv from "dotenv";

dotenv.config();

const requiredVariables = [
  "MONGO_CONNECTION_URL",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "APP_BASE_URL",
];

const requiredEmailVariables = [
  "BREVO_API_KEY",
  "BREVO_SENDER_EMAIL",
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

if (process.env.NODE_ENV === "production") {
  for (const variable of requiredEmailVariables) {
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
  allowedClients: (process.env.ALLOWED_CLIENTS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jsonLimit: process.env.JSON_LIMIT || "1mb",
  uploadRateLimitMax: Number(process.env.UPLOAD_RATE_LIMIT_MAX || 20),
  shareRateLimitMax: Number(process.env.SHARE_RATE_LIMIT_MAX || 60),
  email: {
    apiKey: process.env.BREVO_API_KEY,
    senderEmail: process.env.BREVO_SENDER_EMAIL,
    senderName: process.env.BREVO_SENDER_NAME || "Linkify",
  },
  redisUrl: process.env.REDIS_URL || null,
  r2: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  },
};

if (env.nodeEnv === "production" && !env.appSecret) {
  throw new Error("Missing required environment variable: APP_SECRET");
}
