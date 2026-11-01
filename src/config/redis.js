import { createClient } from "redis";

export let redisClient;
let status = "disabled";

export const connectRedis = async () => {
  if (!process.env.REDIS_URL) return;
  if (redisClient?.isReady) return;

  try {
    if (!redisClient) {
      redisClient = createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => (retries >= 3 ? false : Math.min(retries * 100, 500)),
        },
      });
      redisClient.on("error", (error) => {
        status = "unavailable";
        console.error(`Redis connection error: ${error.message}`);
      });
      redisClient.on("ready", () => {
        status = "connected";
      });
      redisClient.on("end", () => {
        status = "unavailable";
      });
    }

    await redisClient.connect();
    status = "connected";
    console.log("Redis cache connection successful");
  } catch (error) {
    status = "unavailable";
    console.error(`Redis cache unavailable: ${error.message}`);
  }
};

export const getRedisStatus = () => status;

export const closeRedis = async () => {
  if (!redisClient?.isOpen) return;

  try {
    await redisClient.quit();
  } catch (error) {
    console.error(`Redis connection shutdown failed: ${error.message}`);
  } finally {
    status = process.env.REDIS_URL ? "unavailable" : "disabled";
  }
};
