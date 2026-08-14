import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

import { env } from "./config/env.js";
import { connectToMongoDB } from "./config/db.js";
import { connectToRedis, getRedisClient } from "./config/redis.js";
import { startCleanupCron } from "./cron/cleanup.cron.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import fileRoutes from "./routes/file.routes.js";
import viewRoutes from "./routes/view.routes.js";
import { verifyEmailTransport } from "./services/email.service.js";
import { AppError } from "./utils/appError.js";
import { startAllWorkers, closeAllWorkers } from "./workers/index.js";

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
    connectToRedis();
    startAllWorkers();
    
    try {
      await verifyEmailTransport();
    } catch (error) {
      console.error("Email provider verification failed. Continuing without blocking startup.", error);
    }
    startCleanupCron();

    const server = app.listen(env.port, () => {
      console.log(`Server is running on http://${env.host}:${env.port}`);
    });

    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

      // 1. Stop accepting new HTTP connections
      server.close(async () => {
        console.log("HTTP server closed.");

        try {
          // 2. Close BullMQ workers (waits for active jobs to finish)
          await closeAllWorkers();

          // 3. Close general Redis client
          const redisClient = getRedisClient();
          if (redisClient) {
            console.log("Disconnecting general Redis client...");
            await redisClient.quit();
          }

          // 4. Close MongoDB/Mongoose connection
          console.log("Disconnecting MongoDB...");
          await mongoose.disconnect();
          console.log("MongoDB disconnected.");

          console.log("Graceful shutdown completed successfully.");
          process.exit(0);
        } catch (error) {
          console.error("Error during graceful shutdown:", error);
          process.exit(1);
        }
      });

      // Force exit after a safety timeout (e.g. 20 seconds)
      setTimeout(() => {
        console.error("Force exiting: Graceful shutdown timed out.");
        process.exit(1);
      }, 20000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
