import { getRedisClient, isRedisAvailable } from "../config/redis.js";

const CACHE_PREFIX = "file:meta:";

/**
 * Gets cached file metadata by uuid.
 * Falls back to null on cache miss or Redis unavailability.
 */
export const getFileCache = async (uuid) => {
  if (!isRedisAvailable()) return null;

  try {
    const client = getRedisClient();
    const data = await client.get(`${CACHE_PREFIX}${uuid}`);
    if (!data) return null;

    const file = JSON.parse(data);
    // Convert expiresAt back to Date object
    if (file.expiresAt) {
      file.expiresAt = new Date(file.expiresAt);
    }
    return file;
  } catch (error) {
    console.error(`Error reading cache for file uuid ${uuid}:`, error);
    return null;
  }
};

/**
 * Sets file metadata cache by uuid.
 * TTL is set to the minimum of 5 minutes or the file's remaining lifespan.
 */
export const setFileCache = async (uuid, file) => {
  if (!isRedisAvailable() || !file) return;

  try {
    const client = getRedisClient();
    
    const remainingMs = new Date(file.expiresAt).getTime() - Date.now();
    const remainingSec = Math.floor(remainingMs / 1000);
    
    // If the file is already expired or expires in <= 0 seconds, do not cache
    if (remainingSec <= 0) return;

    const cacheTtlSec = Math.min(remainingSec, 300); // 5 minutes max

    // Store as JSON string
    await client.setex(
      `${CACHE_PREFIX}${uuid}`,
      cacheTtlSec,
      JSON.stringify(file)
    );
  } catch (error) {
    console.error(`Error setting cache for file uuid ${uuid}:`, error);
  }
};

/**
 * Invalidates file metadata cache by uuid.
 */
export const invalidateFileCache = async (uuid) => {
  if (!isRedisAvailable()) return;

  try {
    const client = getRedisClient();
    await client.del(`${CACHE_PREFIX}${uuid}`);
  } catch (error) {
    console.error(`Error invalidating cache for file uuid ${uuid}:`, error);
  }
};
