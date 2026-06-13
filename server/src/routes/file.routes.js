import { Router } from "express";

import {
  shareFileByEmail,
  uploadFile,
  verifyPassword,
} from "../controllers/file.controller.js";
import { singleFileUploadMiddleware } from "../config/multer.js";
import {
  shareRateLimiter,
  uploadRateLimiter,
} from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/upload", uploadRateLimiter, singleFileUploadMiddleware, uploadFile);
router.post("/verify-password", shareRateLimiter, verifyPassword);
// Send file share link via Brevo email REST API (rate-limited)
router.post("/send", shareRateLimiter, shareFileByEmail);

router.post("/", uploadRateLimiter, singleFileUploadMiddleware, uploadFile);

export default router;
