import { Redis as UpstashRedis } from "@upstash/redis";
import IoRedis from "ioredis";

declare global {
  // Prevent multiple client instances in development hot reload
  var __upstashRedisClient: UpstashRedis | undefined;
  var __ioRedisClient: IoRedis | undefined;
}

type RedisAdapterType = "upstash" | "ioredis" | "none";

interface RedisClientHolder {
  type: RedisAdapterType;
  upstash?: UpstashRedis;
  ioredis?: IoRedis;
}

function initRedisClients(): RedisClientHolder {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // 1. Prefer Upstash HTTP REST if configured (ideal for Vercel/Serverless)
  if (upstashUrl && upstashToken) {
    if (!globalThis.__upstashRedisClient) {
      globalThis.__upstashRedisClient = new UpstashRedis({
        url: upstashUrl,
        token: upstashToken,
      });
    }
    return { type: "upstash", upstash: globalThis.__upstashRedisClient };
  }

  // 2. Fallback to standard Redis URL (TCP client for Docker / Redis Cloud / AWS)
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    if (!globalThis.__ioRedisClient) {
      const client = new IoRedis(redisUrl, {
        maxRetriesPerRequest: 2,
        connectTimeout: 3000,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
          if (times > 3) return null; // Stop retrying after 3 attempts
          return Math.min(times * 200, 1000);
        },
      });

      client.on("error", (err) => {
        console.warn("[Redis Connection Warning]", err.message);
      });

      globalThis.__ioRedisClient = client;
    }
    return { type: "ioredis", ioredis: globalThis.__ioRedisClient };
  }

  return { type: "none" };
}

/**
 * Gets the string value stored at key. Returns null if missing or error occurs.
 */
export async function redisGet(key: string): Promise<string | null> {
  try {
    const holder = initRedisClients();
    if (holder.type === "upstash" && holder.upstash) {
      const val = await holder.upstash.get<string | object>(key);
      if (val === null || val === undefined) return null;
      return typeof val === "string" ? val : JSON.stringify(val);
    }
    if (holder.type === "ioredis" && holder.ioredis) {
      return await holder.ioredis.get(key);
    }
  } catch (err: any) {
    console.warn(`[Redis GET Failed] Key: ${key} |`, err.message || err);
  }
  return null;
}

/**
 * Sets key to store the string value with optional TTL (in seconds).
 */
export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<boolean> {
  try {
    const holder = initRedisClients();
    if (holder.type === "upstash" && holder.upstash) {
      if (ttlSeconds && ttlSeconds > 0) {
        await holder.upstash.set(key, value, { ex: ttlSeconds });
      } else {
        await holder.upstash.set(key, value);
      }
      return true;
    }
    if (holder.type === "ioredis" && holder.ioredis) {
      if (ttlSeconds && ttlSeconds > 0) {
        await holder.ioredis.set(key, value, "EX", ttlSeconds);
      } else {
        await holder.ioredis.set(key, value);
      }
      return true;
    }
  } catch (err: any) {
    console.warn(`[Redis SET Failed] Key: ${key} |`, err.message || err);
  }
  return false;
}

/**
 * Deletes a specified key from Redis.
 */
export async function redisDel(key: string): Promise<boolean> {
  try {
    const holder = initRedisClients();
    if (holder.type === "upstash" && holder.upstash) {
      await holder.upstash.del(key);
      return true;
    }
    if (holder.type === "ioredis" && holder.ioredis) {
      await holder.ioredis.del(key);
      return true;
    }
  } catch (err: any) {
    console.warn(`[Redis DEL Failed] Key: ${key} |`, err.message || err);
  }
  return false;
}

/**
 * Checks if Redis client is configured and operational.
 */
export function isRedisConfigured(): boolean {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisUrl = process.env.REDIS_URL;
  return Boolean((upstashUrl && process.env.UPSTASH_REDIS_REST_TOKEN) || redisUrl);
}
