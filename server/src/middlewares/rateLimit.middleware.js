import rateLimit, { MemoryStore } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

import { env } from "../config/env.js";
import { getRedisClient, isRedisAvailable } from "../config/redis.js";

/**
 * A wrapper store that delegates to RedisStore if Redis is available,
 * otherwise falls back to the in-memory MemoryStore.
 */
class FallbackRateLimitStore {
  constructor(prefix) {
    this.prefix = prefix;
    this.memoryStore = new MemoryStore();
    this.redisStore = null;
    this.options = null;
  }

  init(options) {
    this.options = options;
    this.memoryStore.init(options);
  }

  _getStore() {
    if (isRedisAvailable()) {
      if (!this.redisStore) {
        this.redisStore = new RedisStore({
          sendCommand: async (...args) => {
            const client = getRedisClient();
            return client.call(...args);
          },
          prefix: this.prefix,
        });
        if (this.options) {
          this.redisStore.init(this.options);
        }
      }
      return this.redisStore;
    }
    return this.memoryStore;
  }

  async increment(key) {
    const store = this._getStore();
    return store.increment(key);
  }

  async decrement(key) {
    const store = this._getStore();
    return store.decrement(key);
  }

  async resetKey(key) {
    const store = this._getStore();
    return store.resetKey(key);
  }
}

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
  store: new FallbackRateLimitStore("rl:upload:"),
});

export const viewRateLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.VIEW_RATE_LIMIT_MAX || 300),
  store: new FallbackRateLimitStore("rl:view:"),
});

export const shareRateLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.SHARE_RATE_LIMIT_MAX || 5),
  message: {
    success: false,
    message: "You have sent too many emails recently. Please wait before sharing again.",
  },
  store: new FallbackRateLimitStore("rl:share:"),
});
