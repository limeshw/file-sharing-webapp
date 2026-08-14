import Redis from "ioredis";
import { env } from "./env.js";

let redisClient = null;
let isRedisReady = false;

let hasLoggedError = false;

export const connectToRedis = () => {
  if (!env.redisUrl) {
    console.warn("REDIS_URL is not set. Running in Redis-disabled mode.");
    return null;
  }

  try {
    redisClient = new Redis(env.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      reconnectOnError: (err) => {
        return true;
      },
    });

    redisClient.on("connect", () => {
      // Quiet connect
    });

    redisClient.on("ready", () => {
      isRedisReady = true;
      if (hasLoggedError) {
        console.log("Redis connection recovered.");
        hasLoggedError = false;
      } else {
        console.log("Redis is ready and connected.");
      }
    });

    redisClient.on("error", (error) => {
      isRedisReady = false;
      if (!hasLoggedError) {
        const errorDetail = error.message || error.code || String(error);
        console.error("Redis connection failed:", errorDetail);
        console.warn("Application will continue running in fallback mode using MongoDB and in-memory stores.");
        hasLoggedError = true;
      }
    });

    redisClient.on("close", () => {
      isRedisReady = false;
    });

    redisClient.on("reconnecting", (delay) => {
      // Quiet reconnecting to prevent log flooding
    });

  } catch (error) {
    console.error("Failed to initialize Redis client:", error);
    redisClient = null;
    isRedisReady = false;
  }

  return redisClient;
};

export const getRedisClient = () => redisClient;
export const isRedisAvailable = () => redisClient !== null && isRedisReady;
