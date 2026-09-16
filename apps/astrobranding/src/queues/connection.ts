import IORedis from "ioredis";

const redisUrl = process.env.VALKEY_URL || "redis://127.0.0.1:6379";

export function createRedisClient() {
  const client = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy(times) {
      // Exponential backoff up to 10s, don't spam errors
      return Math.min(times * 1000, 10000);
    },
  });

  client.on("error", (err) => {
    // Graceful standby log
  });

  return client;
}

export const redisConnection = createRedisClient();
