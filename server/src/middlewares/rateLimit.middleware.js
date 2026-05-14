import rateLimit from "express-rate-limit";

import { env } from "../config/env.js";

const baseConfig = {
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
};

export const uploadRateLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  max: env.uploadRateLimitMax,
});

export const viewRateLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.VIEW_RATE_LIMIT_MAX || 300),
});

export const shareRateLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  max: env.shareRateLimitMax,
});
