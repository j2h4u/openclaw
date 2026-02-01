/**
 * Tool for accessing raw Telegram updates.
 * Designed to be easily removable - standalone module.
 *
 * To disable: remove registration from channel-tools.ts
 */

import { Type } from "@sinclair/typebox";
import type { ChannelAgentTool } from "../../channels/plugins/types.js";
import { rawUpdateBuffer } from "../raw-update-buffer.js";

const MAX_UPDATES_PER_REQUEST = 20;
const MAX_JSON_LENGTH = 8000;

function truncateJson(obj: unknown, maxLength: number): string {
  const json = JSON.stringify(obj, null, 2);
  if (json.length <= maxLength) {
    return json;
  }
  return json.slice(0, maxLength) + "\n... (truncated)";
}

export function createTelegramRawUpdateTool(): ChannelAgentTool {
  return {
    label: "Telegram Raw Update",
    name: "telegram_raw_update",
    description: [
      "Access raw Telegram API updates for diagnostics.",
      "Actions:",
      "- recent: Get recent updates (default: 5, max: 20)",
      "- stats: Get buffer statistics",
      "- get: Get specific update by ID",
    ].join("\n"),
    parameters: Type.Object({
      action: Type.Optional(
        Type.Unsafe<"recent" | "stats" | "get">({
          type: "string",
          enum: ["recent", "stats", "get"],
          default: "recent",
        }),
      ),
      count: Type.Optional(Type.Number({ minimum: 1, maximum: MAX_UPDATES_PER_REQUEST })),
      updateId: Type.Optional(Type.Number()),
      chatId: Type.Optional(Type.Union([Type.String(), Type.Number()])),
    }),
    execute: async (_toolCallId, args) => {
      const params = args as {
        action?: "recent" | "stats" | "get";
        count?: number;
        updateId?: number;
        chatId?: string | number;
      };

      const action = params.action ?? "recent";

      if (action === "stats") {
        const stats = rawUpdateBuffer.getStats();
        const text = [
          "## Raw Update Buffer Stats",
          "",
          `- Count: ${stats.count}`,
          stats.oldestAt ? `- Oldest: ${new Date(stats.oldestAt).toISOString()}` : null,
          stats.newestAt ? `- Newest: ${new Date(stats.newestAt).toISOString()}` : null,
        ]
          .filter(Boolean)
          .join("\n");

        return {
          content: [{ type: "text", text }],
          details: stats,
        };
      }

      if (action === "get") {
        if (typeof params.updateId !== "number") {
          return {
            content: [{ type: "text", text: "Error: updateId is required for 'get' action" }],
            details: { error: "missing_update_id" },
          };
        }

        const update = rawUpdateBuffer.getById(params.updateId);
        if (!update) {
          return {
            content: [{ type: "text", text: `No update found with ID ${params.updateId}` }],
            details: { found: false },
          };
        }

        const text = [
          `## Update ${update.updateId}`,
          "",
          `- Type: ${update.type}`,
          `- Chat: ${update.chatId ?? "N/A"}`,
          `- Received: ${new Date(update.receivedAt).toISOString()}`,
          "",
          "### Raw JSON",
          "```json",
          truncateJson(update.raw, MAX_JSON_LENGTH),
          "```",
        ].join("\n");

        return {
          content: [{ type: "text", text }],
          details: { found: true, updateId: update.updateId },
        };
      }

      // Default: recent
      const count = Math.min(params.count ?? 5, MAX_UPDATES_PER_REQUEST);
      const updates = rawUpdateBuffer.getRecent(count, params.chatId);

      if (updates.length === 0) {
        return {
          content: [{ type: "text", text: "No recent updates in buffer." }],
          details: { count: 0 },
        };
      }

      const lines = ["## Recent Telegram Updates", ""];

      for (const update of updates) {
        lines.push(`### Update ${update.updateId} (${update.type})`);
        lines.push(`- Chat: ${update.chatId ?? "N/A"}`);
        lines.push(`- Received: ${new Date(update.receivedAt).toISOString()}`);
        lines.push("");
        lines.push("```json");
        lines.push(truncateJson(update.raw, MAX_JSON_LENGTH / updates.length));
        lines.push("```");
        lines.push("");
      }

      return {
        content: [{ type: "text", text: lines.join("\n") }],
        details: { count: updates.length },
      };
    },
  };
}
