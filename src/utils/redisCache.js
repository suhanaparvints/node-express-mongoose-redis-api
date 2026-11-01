import { redisClient } from "../config/redis.js";

export const getCache = async (key) => {
  if (!redisClient?.isReady) return null;

  try {
    const value = await redisClient.get(key);
    return value === null ? null : JSON.parse(value);
  } catch (error) {
    console.error(`Redis cache read failed for "${key}": ${error.message}`);
    return null;
  }
};

export const setCache = async (key, value, ttlSeconds) => {
  if (!redisClient?.isReady) return;

  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.error(`Redis cache write failed for "${key}": ${error.message}`);
  }
};

export const deleteCache = async (key) => {
  if (!redisClient?.isReady) return;

  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(`Redis cache invalidation failed for "${key}": ${error.message}`);
  }
};
