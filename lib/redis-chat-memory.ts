import { redisGet, redisSet, redisDel } from "./redis";

export type ChatMessage = {
  role: "system" | "user";
  content: string;
};

const DEFAULT_CHAT_TTL_SECONDS = 86400; // 24 hours cache TTL for active interviews

function getChatKey(interviewId: string): string {
  return `interview:chat:${interviewId}`;
}

/**
 * Retrieves cached chat memory history for an interview session from Redis.
 * Returns null on cache miss or if Redis is unconfigured/erroring.
 */
export async function getCachedChatMemory(
  interviewId: string
): Promise<ChatMessage[] | null> {
  if (!interviewId) return null;

  try {
    const rawData = await redisGet(getChatKey(interviewId));
    if (!rawData) return null;

    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed)) {
      return parsed as ChatMessage[];
    }
  } catch (err: any) {
    console.warn(`[ChatMemory Cache Read Error] interviewId: ${interviewId} |`, err.message || err);
  }

  return null;
}

/**
 * Saves or updates the interview chat memory history in Redis.
 */
export async function setCachedChatMemory(
  interviewId: string,
  history: ChatMessage[],
  ttlSeconds: number = DEFAULT_CHAT_TTL_SECONDS
): Promise<boolean> {
  if (!interviewId || !Array.isArray(history)) return false;

  try {
    const serialized = JSON.stringify(history);
    return await redisSet(getChatKey(interviewId), serialized, ttlSeconds);
  } catch (err: any) {
    console.warn(`[ChatMemory Cache Write Error] interviewId: ${interviewId} |`, err.message || err);
    return false;
  }
}

/**
 * Appends a new chat message turn (system question or user answer) to the Redis chat memory cache.
 */
export async function appendChatMessageToCache(
  interviewId: string,
  message: ChatMessage
): Promise<boolean> {
  if (!interviewId || !message || !message.content) return false;

  try {
    const current = (await getCachedChatMemory(interviewId)) || [];
    current.push(message);
    return await setCachedChatMemory(interviewId, current);
  } catch (err: any) {
    console.warn(`[ChatMemory Cache Append Error] interviewId: ${interviewId} |`, err.message || err);
    return false;
  }
}

/**
 * Removes the cached chat memory for an interview upon completion or reset.
 */
export async function clearCachedChatMemory(
  interviewId: string
): Promise<boolean> {
  if (!interviewId) return false;

  try {
    return await redisDel(getChatKey(interviewId));
  } catch (err: any) {
    console.warn(`[ChatMemory Cache Clear Error] interviewId: ${interviewId} |`, err.message || err);
    return false;
  }
}
