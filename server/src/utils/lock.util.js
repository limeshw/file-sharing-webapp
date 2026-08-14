import { getRedisClient, isRedisAvailable } from "../config/redis.js";

const LOCK_PREFIX = "lock:upload:";

/**
 * Tries to acquire a lock for a given R2 key.
 * If Redis is unavailable, returns true (fails open/available).
 * @param {string} key - The R2 object key
 * @param {number} ttlSeconds - Lock TTL in seconds
 * @returns {Promise<boolean>} - true if lock acquired or Redis is down, false if lock is already held.
 */
export const acquireUploadLock = async (key, ttlSeconds = 15) => {
  if (!isRedisAvailable()) {
    return true;
  }

  try {
    const client = getRedisClient();
    const lockKey = `${LOCK_PREFIX}${key}`;
    const value = "locked";
    
    // SET with NX (set if not exist) and EX (expire in seconds)
    const result = await client.set(lockKey, value, "NX", "EX", ttlSeconds);
    return result === "OK";
  } catch (error) {
    console.error(`Error acquiring lock for key ${key}:`, error);
    // On Redis failure, fall back to true to maintain availability
    return true;
  }
};

/**
 * Releases the lock for the given R2 key.
 */
export const releaseUploadLock = async (key) => {
  if (!isRedisAvailable()) return;

  try {
    const client = getRedisClient();
    const lockKey = `${LOCK_PREFIX}${key}`;
    await client.del(lockKey);
  } catch (error) {
    console.error(`Error releasing lock for key ${key}:`, error);
  }
};
