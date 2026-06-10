import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { env } from "./config/env.js";
import { connectToMongoDB } from "./config/db.js";
import { startCleanupCron } from "./cron/cleanup.cron.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import fileRoutes from "./routes/file.routes.js";
import viewRoutes from "./routes/view.routes.js";
import { verifyEmailTransport } from "./services/email.service.js";
import { AppError } from "./utils/appError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (!env.allowedClients.length || env.allowedClients.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new AppError("CORS not allowed", 403));
  },
  methods: ["GET", "POST"],
};

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.use(compression());
app.use(requestLogger);
app.use(express.json({ limit: env.jsonLimit }));
app.use(express.urlencoded({ extended: true, limit: env.jsonLimit }));
app.use(express.static(path.resolve(__dirname, "../public")));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "./views"));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Linkify backend is healthy",
  });
});

app.use("/api/files", fileRoutes);
app.use("/files", viewRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectToMongoDB();
    await verifyEmailTransport();
    startCleanupCron();

    app.listen(env.port, () => {
      console.log(`Server is running on http://${env.host}:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
