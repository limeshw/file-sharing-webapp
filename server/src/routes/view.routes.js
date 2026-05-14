import { Router } from "express";

import {
  downloadFile,
  fileInfo,
  showFilePage,
} from "../controllers/view.controller.js";
import { viewRateLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.get("/meta/:uuid", viewRateLimiter, fileInfo);
router.get("/download/:uuid", viewRateLimiter, downloadFile);
router.get("/:uuid", viewRateLimiter, showFilePage);

export default router;
