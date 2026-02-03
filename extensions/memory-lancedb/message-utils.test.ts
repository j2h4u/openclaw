/**
 * Message utility tests
 *
 * Tests for stripping envelope headers, sender prefixes, and memory tags
 * to extract clean user text for memory capture.
 */

import { describe, test, expect } from "vitest";
import {
  stripEnvelopeHeader,
  stripSenderPrefix,
  stripMemoryTags,
  stripMessageIdSuffix,
  stripMessageMetadata,
  parseEnvelopeMetadata,
} from "./message-utils.js";

describe("message-utils", () => {
  describe("stripEnvelopeHeader", () => {
    test("strips Telegram envelope", () => {
      const input = "[Telegram Maxim ⁽²ʰ⁴ᵘ⁾ (@j2h4u) id:591994976 +5m 2026-02-03 04:53 GMT+5] я люблю ночь";
      expect(stripEnvelopeHeader(input)).toBe("я люблю ночь");
    });

    test("strips Discord envelope", () => {
      const input = "[Discord User#1234 id:123456789 +2h 2026-02-03 12:00 UTC] hello world";
      expect(stripEnvelopeHeader(input)).toBe("hello world");
    });

    test("strips minimal envelope", () => {
      const input = "[Signal] message text";
      expect(stripEnvelopeHeader(input)).toBe("message text");
    });

    test("strips envelope with elapsed time only", () => {
      const input = "[Telegram User +30s] quick message";
      expect(stripEnvelopeHeader(input)).toBe("quick message");
    });

    test("preserves text without envelope", () => {
      const input = "just plain text";
      expect(stripEnvelopeHeader(input)).toBe("just plain text");
    });

    test("preserves brackets in middle of text", () => {
      const input = "some text [with brackets] inside";
      expect(stripEnvelopeHeader(input)).toBe("some text [with brackets] inside");
    });
  });

  describe("stripSenderPrefix", () => {
    test("strips simple sender prefix", () => {
      const input = "Maxim: hello there";
      expect(stripSenderPrefix(input)).toBe("hello there");
    });

    test("strips username with emoji", () => {
      const input = "Алексей 🚀: привет";
      expect(stripSenderPrefix(input)).toBe("привет");
    });

    test("preserves text without prefix", () => {
      const input = "no prefix here";
      expect(stripSenderPrefix(input)).toBe("no prefix here");
    });

    test("does not strip very long prefixes (>50 chars)", () => {
      const longName = "A".repeat(51);
      const input = `${longName}: message`;
      expect(stripSenderPrefix(input)).toBe(input);
    });

    test("handles colon in message body", () => {
      // Only first colon within 50 chars is considered sender prefix
      const input = "User: time is 10:30";
      expect(stripSenderPrefix(input)).toBe("time is 10:30");
    });

    test("does not strip across newlines", () => {
      const input = "Line one\nUser: line two";
      expect(stripSenderPrefix(input)).toBe("Line one\nUser: line two");
    });
  });

  describe("stripMemoryTags", () => {
    test("strips relevant-memories tag", () => {
      const input = "<relevant-memories>\n- fact 1\n- fact 2\n</relevant-memories>\nUser message";
      expect(stripMemoryTags(input)).toBe("\nUser message");
    });

    test("strips multiple memory tags", () => {
      const input = "<relevant-memories>first</relevant-memories> middle <relevant-memories>second</relevant-memories> end";
      expect(stripMemoryTags(input)).toBe(" middle  end");
    });

    test("preserves text without memory tags", () => {
      const input = "just regular text";
      expect(stripMemoryTags(input)).toBe("just regular text");
    });

    test("handles empty memory tags", () => {
      const input = "<relevant-memories></relevant-memories>text";
      expect(stripMemoryTags(input)).toBe("text");
    });
  });

  describe("stripMessageIdSuffix", () => {
    test("strips message_id suffix with newline", () => {
      const input = "я люблю ночь\n[message_id: 994]";
      expect(stripMessageIdSuffix(input)).toBe("я люблю ночь");
    });

    test("strips message_id suffix without newline", () => {
      const input = "hello[message_id: 123]";
      expect(stripMessageIdSuffix(input)).toBe("hello");
    });

    test("strips message_id with extra spaces", () => {
      const input = "text\n[message_id:  456]  ";
      expect(stripMessageIdSuffix(input)).toBe("text");
    });

    test("preserves text without message_id", () => {
      const input = "just regular text";
      expect(stripMessageIdSuffix(input)).toBe("just regular text");
    });

    test("preserves message_id in middle of text", () => {
      const input = "see [message_id: 123] for reference";
      expect(stripMessageIdSuffix(input)).toBe("see [message_id: 123] for reference");
    });
  });

  describe("stripMessageMetadata (full pipeline)", () => {
    test("strips memory tags + envelope + sender prefix", () => {
      const input = "<relevant-memories>\n- User likes tea\n</relevant-memories>\n[Telegram Maxim (@j2h4u) id:123 +5m 2026-02-03 04:53 GMT+5] Maxim: я люблю ночь";
      expect(stripMessageMetadata(input)).toBe("я люблю ночь");
    });

    test("handles envelope without sender prefix (DM)", () => {
      const input = "[Telegram User +5s 2026-02-03 04:53] я люблю ночь";
      expect(stripMessageMetadata(input)).toBe("я люблю ночь");
    });

    test("handles memory tags before envelope", () => {
      const input = "<relevant-memories>context</relevant-memories>[Signal +1m] hello";
      expect(stripMessageMetadata(input)).toBe("hello");
    });

    test("handles just memory tags", () => {
      const input = "<relevant-memories>old stuff</relevant-memories>new info";
      expect(stripMessageMetadata(input)).toBe("new info");
    });

    test("handles plain text (no metadata)", () => {
      const input = "я люблю ночь";
      expect(stripMessageMetadata(input)).toBe("я люблю ночь");
    });

    test("handles complex real-world example", () => {
      const input = `<relevant-memories>
- Maxim likes mountains
- Maxim prefers tea
</relevant-memories>
[Telegram Maxim ⁽²ʰ⁴ᵘ⁾ (@j2h4u) id:591994976 +14m 2026-02-03 04:53 GMT+5] Maxim: я люблю ночь`;
      expect(stripMessageMetadata(input)).toBe("я люблю ночь");
    });

    test("preserves message with colons in content", () => {
      const input = "[Telegram User +1s] User: time is 10:30:45";
      expect(stripMessageMetadata(input)).toBe("time is 10:30:45");
    });

    test("handles whitespace correctly", () => {
      const input = "  <relevant-memories>x</relevant-memories>  [Signal +1s]   User:   hello  ";
      expect(stripMessageMetadata(input)).toBe("hello");
    });

    test("strips message_id suffix", () => {
      const input = "я люблю ночь\n[message_id: 994]";
      expect(stripMessageMetadata(input)).toBe("я люблю ночь");
    });

    test("strips everything: memory tags + envelope + sender + message_id", () => {
      const input = `<relevant-memories>
- User prefers tea
</relevant-memories>
[Telegram User (@j2h4u) id:123 +5m 2026-02-03] User: я люблю ночь
[message_id: 994]`;
      expect(stripMessageMetadata(input)).toBe("я люблю ночь");
    });
  });

  describe("parseEnvelopeMetadata", () => {
    test("parses full Telegram envelope", () => {
      const input = "[Telegram Maxim ⁽²ʰ⁴ᵘ⁾ (@j2h4u) id:591994976 +5m 2026-02-03 04:53 GMT+5] hello";
      const result = parseEnvelopeMetadata(input);
      expect(result.channel).toBe("telegram");
      expect(result.username).toBe("j2h4u");
      expect(result.chatId).toBe("591994976");
    });

    test("parses Discord envelope", () => {
      const input = "[Discord User#1234 id:123456789 +2h 2026-02-03] hello";
      const result = parseEnvelopeMetadata(input);
      expect(result.channel).toBe("discord");
      expect(result.chatId).toBe("123456789");
    });

    test("parses Signal envelope without id", () => {
      const input = "[Signal +1m] hello";
      const result = parseEnvelopeMetadata(input);
      expect(result.channel).toBe("signal");
      expect(result.username).toBeUndefined();
      expect(result.chatId).toBeUndefined();
    });

    test("extracts username from @handle", () => {
      const input = "[Telegram (@testuser) id:123] hi";
      const result = parseEnvelopeMetadata(input);
      expect(result.username).toBe("testuser");
    });

    test("falls back to display name when no @handle", () => {
      const input = "[Telegram Алексей id:123] hi";
      const result = parseEnvelopeMetadata(input);
      expect(result.username).toBe("Алексей");
    });

    test("returns empty object for text without envelope", () => {
      const input = "just plain text";
      const result = parseEnvelopeMetadata(input);
      expect(result.channel).toBeUndefined();
      expect(result.username).toBeUndefined();
      expect(result.chatId).toBeUndefined();
    });

    test("handles envelope after memory tags (needs trimmed input)", () => {
      // parseEnvelopeMetadata expects cleaned input (memory tags stripped)
      const input = "[Telegram User (@test) id:456] message";
      const result = parseEnvelopeMetadata(input);
      expect(result.channel).toBe("telegram");
      expect(result.username).toBe("test");
      expect(result.chatId).toBe("456");
    });
  });
});
