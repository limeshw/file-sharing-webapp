import { Router } from "express";

import {
  confirmUpload,
  prepareUpload,
  shareFileByEmail,
  verifyPassword,
} from "../controllers/file.controller.js";
import {
  shareRateLimiter,
  uploadRateLimiter,
} from "../middlewares/rateLimit.middleware.js";

const router = Router();

// Step 1: validate metadata → receive presigned R2 PUT URL + object key
router.post("/prepare-upload", uploadRateLimiter, prepareUpload);

// Step 2: frontend PUT file to R2 → confirm to create MongoDB record
router.post("/confirm-upload", uploadRateLimiter, confirmUpload);

router.post("/verify-password", shareRateLimiter, verifyPassword);
// Send file share link via Brevo email REST API (rate-limited)
router.post("/send", shareRateLimiter, shareFileByEmail);

export default router;
