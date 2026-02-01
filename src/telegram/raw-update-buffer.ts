/**
 * Circular buffer for storing recent Telegram updates.
 * Designed to be easily removable - no dependencies on other modules.
 *
 * Usage:
 *   import { rawUpdateBuffer } from "./raw-update-buffer.js";
 *   rawUpdateBuffer.push(update);
 *   const recent = rawUpdateBuffer.getRecent(10);
 *
 * To disable: simply don't call push() or remove the import.
 */

export type BufferedUpdate = {
  updateId: number;
  receivedAt: number;
  chatId?: number | string;
  type: string;
  raw: unknown;
};

type RawUpdateBufferConfig = {
  maxSize: number;
  ttlMs: number;
};

const DEFAULT_CONFIG: RawUpdateBufferConfig = {
  maxSize: 100,
  ttlMs: 30 * 60 * 1000, // 30 minutes
};

class RawUpdateBuffer {
  private buffer: BufferedUpdate[] = [];
  private config: RawUpdateBufferConfig;

  constructor(config: Partial<RawUpdateBufferConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Add an update to the buffer.
   */
  push(update: unknown): void {
    if (!update || typeof update !== "object") {
      return;
    }

    const typed = update as {
      update_id?: number;
      message?: { chat?: { id?: number } };
      edited_message?: { chat?: { id?: number } };
      channel_post?: { chat?: { id?: number } };
      callback_query?: { message?: { chat?: { id?: number } } };
      message_reaction?: { chat?: { id?: number } };
    };

    const updateId = typed.update_id;
    if (typeof updateId !== "number") {
      return;
    }

    // Determine update type
    const type = typed.message
      ? "message"
      : typed.edited_message
        ? "edited_message"
        : typed.channel_post
          ? "channel_post"
          : typed.callback_query
            ? "callback_query"
            : typed.message_reaction
              ? "message_reaction"
              : "unknown";

    // Extract chat ID
    const chatId =
      typed.message?.chat?.id ??
      typed.edited_message?.chat?.id ??
      typed.channel_post?.chat?.id ??
      typed.callback_query?.message?.chat?.id ??
      typed.message_reaction?.chat?.id;

    const entry: BufferedUpdate = {
      updateId,
      receivedAt: Date.now(),
      chatId,
      type,
      raw: update,
    };

    // Add to buffer
    this.buffer.push(entry);

    // Trim if over max size
    if (this.buffer.length > this.config.maxSize) {
      this.buffer = this.buffer.slice(-this.config.maxSize);
    }
  }

  /**
   * Get recent updates, optionally filtered by chat ID.
   */
  getRecent(count: number, chatId?: number | string): BufferedUpdate[] {
    this.cleanup();

    let filtered = this.buffer;
    if (chatId !== undefined) {
      const chatIdStr = String(chatId);
      filtered = this.buffer.filter((e) => String(e.chatId) === chatIdStr);
    }

    return filtered.slice(-count).reverse();
  }

  /**
   * Get a specific update by ID.
   */
  getById(updateId: number): BufferedUpdate | undefined {
    this.cleanup();
    return this.buffer.find((e) => e.updateId === updateId);
  }

  /**
   * Get buffer stats.
   */
  getStats(): { count: number; oldestAt?: number; newestAt?: number } {
    this.cleanup();
    if (this.buffer.length === 0) {
      return { count: 0 };
    }
    return {
      count: this.buffer.length,
      oldestAt: this.buffer[0]?.receivedAt,
      newestAt: this.buffer[this.buffer.length - 1]?.receivedAt,
    };
  }

  /**
   * Clear the buffer.
   */
  clear(): void {
    this.buffer = [];
  }

  /**
   * Remove expired entries.
   */
  private cleanup(): void {
    const cutoff = Date.now() - this.config.ttlMs;
    this.buffer = this.buffer.filter((e) => e.receivedAt > cutoff);
  }
}

// Singleton instance - can be replaced with null/noop if feature is disabled
export const rawUpdateBuffer = new RawUpdateBuffer();

// For testing or custom configuration
export function createRawUpdateBuffer(config?: Partial<RawUpdateBufferConfig>): RawUpdateBuffer {
  return new RawUpdateBuffer(config);
}
