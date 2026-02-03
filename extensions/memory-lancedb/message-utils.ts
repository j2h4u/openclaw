/**
 * Message text cleaning utilities for memory capture
 *
 * Handles stripping of:
 * - <relevant-memories> tags (auto-recall injection)
 * - Envelope headers [Channel Sender Timestamp]
 * - Sender prefixes in group messages (Name: text)
 */

/**
 * Strip OpenClaw envelope header from message text
 * Format: [Channel SenderInfo +elapsed Timestamp] body
 * Example: [Telegram Maxim (@user) id:123 +5m 2026-02-03 04:53 GMT+5] hello
 */
export function stripEnvelopeHeader(text: string): string {
  return text.replace(/^\[[^\]]+\]\s*/, "");
}

/**
 * Strip sender prefix in group messages (e.g., "Maxim: hello" -> "hello")
 * Only strips if prefix is reasonable length (1-50 chars) to avoid false positives
 */
export function stripSenderPrefix(text: string): string {
  return text.replace(/^[^:\n]{1,50}:\s*/, "");
}

/**
 * Strip memory recall tags
 * Example: <relevant-memories>...</relevant-memories>
 */
export function stripMemoryTags(text: string): string {
  return text.replace(/<relevant-memories>[\s\S]*?<\/relevant-memories>/g, "");
}

/**
 * Strip message_id suffix appended by OpenClaw message pipeline
 * Example: "Hello\n[message_id: 123]" -> "Hello"
 */
export function stripMessageIdSuffix(text: string): string {
  return text.replace(/\n?\[message_id:\s*\d+\]\s*$/, "");
}

/**
 * Metadata extracted from envelope header
 */
export type EnvelopeMetadata = {
  channel?: string;   // "Telegram", "Discord", "Signal", etc.
  username?: string;  // "@j2h4u" or "Maxim"
  chatId?: string;    // "591994976" from "id:591994976"
};

/**
 * Parse envelope header and extract metadata
 * Format: [Channel SenderInfo id:XXX +elapsed Timestamp]
 * Example: [Telegram Maxim ⁽²ʰ⁴ᵘ⁾ (@j2h4u) id:591994976 +5m 2026-02-03 04:53 GMT+5]
 */
export function parseEnvelopeMetadata(text: string): EnvelopeMetadata {
  const result: EnvelopeMetadata = {};

  // Match envelope header
  const headerMatch = text.match(/^\[([^\]]+)\]/);
  if (!headerMatch) {
    return result;
  }

  const header = headerMatch[1];

  // Extract channel (first word)
  const channelMatch = header.match(/^(\w+)/);
  if (channelMatch) {
    result.channel = channelMatch[1].toLowerCase();
  }

  // Extract username (@handle) - prefer @username over display name
  const usernameMatch = header.match(/@([\w.-]+)/);
  if (usernameMatch) {
    result.username = usernameMatch[1];
  } else {
    // Fallback: extract display name (second word after channel, before special chars)
    const nameMatch = header.match(/^\w+\s+([^\s(+]+)/);
    if (nameMatch) {
      result.username = nameMatch[1];
    }
  }

  // Extract chat/user ID from "id:XXXXX"
  const idMatch = header.match(/\bid:(\d+)/);
  if (idMatch) {
    result.chatId = idMatch[1];
  }

  return result;
}

/**
 * Clean message text for memory capture:
 * 1. Strip <relevant-memories> tags (prevents friendly fire with auto-recall)
 * 2. Strip envelope header [Channel ...] (OpenClaw metadata)
 * 3. Strip sender prefix "Name: " (group messages)
 * 4. Strip [message_id: XXX] suffix (OpenClaw pipeline metadata)
 */
export function stripMessageMetadata(text: string): string {
  let clean = text;
  // 1. Remove memory recall tags
  clean = stripMemoryTags(clean).trim();
  // 2. Remove envelope header (must be at start after trim)
  clean = stripEnvelopeHeader(clean).trim();
  // 3. Remove sender prefix in group messages
  clean = stripSenderPrefix(clean).trim();
  // 4. Remove message_id suffix
  clean = stripMessageIdSuffix(clean);
  return clean.trim();
}
