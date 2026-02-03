/**
 * OpenClaw Memory (LanceDB) Plugin
 *
 * Long-term memory with vector search for AI conversations.
 * Uses LanceDB for storage and OpenAI for embeddings.
 * Provides seamless auto-recall and auto-capture via lifecycle hooks.
 */

import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import * as lancedb from "@lancedb/lancedb";
import { Type } from "@sinclair/typebox";
import { randomUUID } from "node:crypto";
import OpenAI from "openai";
import { stringEnum } from "openclaw/plugin-sdk";
import {
  MEMORY_CATEGORIES,
  type MemoryCategory,
  memoryConfigSchema,
  vectorDimsForModel,
} from "./config.js";
import { matchTrigger, type TriggerCategory } from "./triggers.js";
import { stripMessageMetadata, parseEnvelopeMetadata } from "./message-utils.js";

// ============================================================================
// Types
// ============================================================================

type MemoryEntry = {
  id: string;
  text: string;
  vector: number[];
  importance: number;
  category: MemoryCategory;
  createdAt: number;
  // Optional metadata (may be missing in older entries)
  username?: string;
  channel?: string;
  chatId?: string;
};

type MemorySearchResult = {
  entry: MemoryEntry;
  score: number;
};

// ============================================================================
// LanceDB Provider
// ============================================================================

const TABLE_NAME = "memories";

class MemoryDB {
  private db: lancedb.Connection | null = null;
  private table: lancedb.Table | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(
    private readonly dbPath: string,
    private readonly vectorDim: number,
  ) {}

  private async ensureInitialized(): Promise<void> {
    if (this.table) {
      return;
    }
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    this.db = await lancedb.connect(this.dbPath);
    const tables = await this.db.tableNames();

    if (tables.includes(TABLE_NAME)) {
      this.table = await this.db.openTable(TABLE_NAME);
    } else {
      this.table = await this.db.createTable(TABLE_NAME, [
        {
          id: "__schema__",
          text: "",
          vector: Array.from({ length: this.vectorDim }).fill(0),
          importance: 0,
          category: "other",
          createdAt: 0,
        },
      ]);
      await this.table.delete('id = "__schema__"');
    }
  }

  async store(entry: Omit<MemoryEntry, "id" | "createdAt">): Promise<MemoryEntry> {
    await this.ensureInitialized();

    const fullEntry: MemoryEntry = {
      ...entry,
      id: randomUUID(),
      createdAt: Date.now(),
    };

    await this.table!.add([fullEntry]);
    return fullEntry;
  }

  async search(vector: number[], limit = 5, minScore = 0.5): Promise<MemorySearchResult[]> {
    await this.ensureInitialized();

    const results = await this.table!.vectorSearch(vector).limit(limit).toArray();

    // LanceDB uses L2 distance by default; convert to similarity score
    const mapped = results.map((row) => {
      const distance = row._distance ?? 0;
      // Use inverse for a 0-1 range: sim = 1 / (1 + d)
      const score = 1 / (1 + distance);
      return {
        entry: {
          id: row.id as string,
          text: row.text as string,
          vector: row.vector as number[],
          importance: row.importance as number,
          category: row.category as MemoryEntry["category"],
          createdAt: row.createdAt as number,
          username: row.username as string | undefined,
          channel: row.channel as string | undefined,
          chatId: row.chatId as string | undefined,
        },
        score,
      };
    });

    return mapped.filter((r) => r.score >= minScore);
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureInitialized();
    // Validate UUID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error(`Invalid memory ID format: ${id}`);
    }
    await this.table!.delete(`id = '${id}'`);
    return true;
  }

  async count(): Promise<number> {
    await this.ensureInitialized();
    return this.table!.countRows();
  }

  async list(opts: { limit?: number; offset?: number } = {}): Promise<MemoryEntry[]> {
    await this.ensureInitialized();
    const limit = opts.limit ?? 20;
    const offset = opts.offset ?? 0;

    // LanceDB query with limit/offset
    let query = this.table!.query().limit(limit);
    if (offset > 0) {
      // LanceDB doesn't have native offset, use filter workaround
      // Sort by createdAt DESC and skip manually
      const allRows = await this.table!.query().toArray();
      const sorted = allRows.sort((a, b) => (b.createdAt as number) - (a.createdAt as number));
      const sliced = sorted.slice(offset, offset + limit);
      return sliced.map((row) => ({
        id: row.id as string,
        text: row.text as string,
        vector: row.vector as number[],
        importance: row.importance as number,
        category: row.category as MemoryEntry["category"],
        createdAt: row.createdAt as number,
        username: row.username as string | undefined,
        channel: row.channel as string | undefined,
        chatId: row.chatId as string | undefined,
      }));
    }

    const results = await query.toArray();
    // Sort by createdAt DESC (newest first)
    results.sort((a, b) => (b.createdAt as number) - (a.createdAt as number));

    return results.map((row) => ({
      id: row.id as string,
      text: row.text as string,
      vector: row.vector as number[],
      importance: row.importance as number,
      category: row.category as MemoryEntry["category"],
      createdAt: row.createdAt as number,
      username: row.username as string | undefined,
      channel: row.channel as string | undefined,
      chatId: row.chatId as string | undefined,
    }));
  }
}

// ============================================================================
// Embedding Providers
// ============================================================================

interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

// Timing wrapper for embedding providers
class TimedEmbeddings implements EmbeddingProvider {
  private firstCall = true;

  constructor(
    private inner: EmbeddingProvider,
    private logger: { info: (msg: string) => void },
    private model: string,
  ) {}

  async embed(text: string): Promise<number[]> {
    const start = performance.now();
    const result = await this.inner.embed(text);
    const elapsed = performance.now() - start;

    if (this.firstCall) {
      this.logger.info(`memory-lancedb: first embed (${this.model}): ${elapsed.toFixed(0)}ms (includes model load)`);
      this.firstCall = false;
    } else if (elapsed > 100) {
      // Only log slow embeds (>100ms) to avoid spam
      this.logger.info(`memory-lancedb: embed: ${elapsed.toFixed(0)}ms`);
    }

    return result;
  }
}

class OpenAIEmbeddings implements EmbeddingProvider {
  private client: OpenAI;

  constructor(
    apiKey: string,
    private model: string,
  ) {
    this.client = new OpenAI({ apiKey });
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: text,
    });
    return response.data[0].embedding;
  }
}

// Lazy-loaded Xenova transformers pipeline
let pipelinePromise: Promise<unknown> | null = null;

class LocalEmbeddings implements EmbeddingProvider {
  constructor(private model: string) {}

  private async getPipeline() {
    if (!pipelinePromise) {
      pipelinePromise = (async () => {
        // Dynamic import to avoid loading transformers until needed
        const { pipeline } = await import("@xenova/transformers");
        return pipeline("feature-extraction", this.model);
      })();
    }
    return pipelinePromise;
  }

  async embed(text: string): Promise<number[]> {
    const extractor = (await this.getPipeline()) as (
      text: string,
      options: { pooling: string; normalize: boolean },
    ) => Promise<{ data: Float32Array }>;

    const output = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(output.data);
  }
}

function createEmbeddingProvider(
  cfg: import("./config.js").MemoryConfig["embedding"],
): EmbeddingProvider {
  if (cfg.provider === "local") {
    return new LocalEmbeddings(cfg.model ?? "Xenova/all-MiniLM-L6-v2");
  }
  return new OpenAIEmbeddings(cfg.apiKey, cfg.model ?? "text-embedding-3-small");
}

// ============================================================================
// Rule-based capture filter (patterns in triggers.ts)
// ============================================================================

const TRIGGER_TO_CATEGORY: Record<TriggerCategory, MemoryCategory> = {
  remember: "other",
  preference: "preference",
  decision: "decision",
  identity: "entity",
  fact: "fact",
  importance: "other",
};

// Factory functions that accept language filter (called from register())
// infoLog is passed separately for temporary diagnostics (TEMP)
function createShouldCapture(language: MemoryConfig["language"], debug: (msg: string) => void, infoLog: (msg: string) => void) {
  return function shouldCapture(text: string): boolean {
    const cleanText = stripMessageMetadata(text);

    // If original had memories tag, log and use clean version
    if (cleanText !== text) {
      debug(`[capture] Stripped memories tag, clean text: "${cleanText.slice(0, 60)}..."`);
      infoLog(`[shouldCapture] Stripped memories tag, evaluating clean text`); // TEMP
    }

    const preview = cleanText.length > 60 ? cleanText.slice(0, 60) + "..." : cleanText;

    if (cleanText.length < 10) {
      debug(`[capture] SKIP (too short: ${cleanText.length} chars): "${preview}"`);
      infoLog(`[shouldCapture] SKIP (too short: ${cleanText.length}): "${preview}"`); // TEMP
      return false;
    }
    if (cleanText.length > 500) {
      debug(`[capture] SKIP (too long: ${cleanText.length} chars): "${preview}"`);
      infoLog(`[shouldCapture] SKIP (too long: ${cleanText.length}): "${preview}"`); // TEMP
      return false;
    }
    // Skip system-generated content (but not if it was just memories that we stripped)
    if (cleanText.startsWith("<") && cleanText.includes("</")) {
      debug(`[capture] SKIP (system content): "${preview}"`);
      infoLog(`[shouldCapture] SKIP (system content): "${preview}"`); // TEMP
      return false;
    }
    // Skip agent summary responses (contain markdown formatting)
    if (cleanText.includes("**") && cleanText.includes("\n-")) {
      debug(`[capture] SKIP (markdown response): "${preview}"`);
      infoLog(`[shouldCapture] SKIP (markdown): "${preview}"`); // TEMP
      return false;
    }
    // Skip emoji-heavy responses (likely agent output)
    const emojiCount = (cleanText.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount > 3) {
      debug(`[capture] SKIP (emoji-heavy: ${emojiCount}): "${preview}"`);
      infoLog(`[shouldCapture] SKIP (emoji ${emojiCount}): "${preview}"`); // TEMP
      return false;
    }

    const match = matchTrigger(cleanText, language);
    if (match) {
      debug(`[capture] MATCH trigger "${match.category}" (lang: ${match.lang}, weight: ${match.weight}): "${preview}"`);
      infoLog(`[shouldCapture] MATCH ${match.category}/${match.lang}: "${preview}"`); // TEMP
      return true;
    }

    debug(`[capture] SKIP (no trigger matched, lang filter: ${JSON.stringify(language)}): "${preview}"`);
    infoLog(`[shouldCapture] SKIP (no trigger, lang=${JSON.stringify(language)}): "${preview}"`); // TEMP
    return false;
  };
}

function createDetectCategory(language: MemoryConfig["language"]) {
  return function detectCategory(text: string): MemoryCategory {
    const match = matchTrigger(text, language);
    if (match) {
      return TRIGGER_TO_CATEGORY[match.category];
    }
    return "other";
  };
}

// ============================================================================
// Plugin Definition
// ============================================================================

const memoryPlugin = {
  id: "memory-lancedb",
  name: "Memory (LanceDB)",
  description: "LanceDB-backed long-term memory with auto-recall/capture",
  kind: "memory" as const,
  configSchema: memoryConfigSchema,

  register(api: OpenClawPluginApi) {
    const cfg = memoryConfigSchema.parse(api.pluginConfig);
    const resolvedDbPath = api.resolvePath(cfg.dbPath!);
    const defaultModel =
      cfg.embedding.provider === "local" ? "Xenova/all-MiniLM-L6-v2" : "text-embedding-3-small";
    const vectorDim = vectorDimsForModel(cfg.embedding.model ?? defaultModel);

    // Debug logger for capture analysis (visible in gateway logs)
    const debug = (msg: string) => api.logger.debug?.(`memory-lancedb: ${msg}`);
    // TEMP: info-level logging for auto-capture diagnostics
    const infoLog = (msg: string) => api.logger.info(`memory-lancedb: ${msg}`);

    // Create capture functions with language filter from config
    const shouldCapture = createShouldCapture(cfg.language, debug, infoLog);
    const detectCategory = createDetectCategory(cfg.language);
    const db = new MemoryDB(resolvedDbPath, vectorDim);
    const modelName = cfg.embedding.model ?? (cfg.embedding.provider === "local" ? "Xenova/all-MiniLM-L6-v2" : "text-embedding-3-small");
    const embeddings = new TimedEmbeddings(createEmbeddingProvider(cfg.embedding), api.logger, modelName);

    api.logger.info(`memory-lancedb: plugin registered (db: ${resolvedDbPath}, model: ${modelName}, lazy init)`);

    // ========================================================================
    // Tools
    // ========================================================================

    api.registerTool(
      {
        name: "memory_recall",
        label: "Memory Recall",
        description:
          "Search through long-term memories. Use when you need context about user preferences, past decisions, or previously discussed topics.",
        parameters: Type.Object({
          query: Type.String({ description: "Search query" }),
          limit: Type.Optional(Type.Number({ description: "Max results (default: 5)" })),
        }),
        async execute(_toolCallId, params) {
          const { query, limit = 5 } = params as { query: string; limit?: number };

          const vector = await embeddings.embed(query);
          const results = await db.search(vector, limit, 0.1);

          if (results.length === 0) {
            return {
              content: [{ type: "text", text: "No relevant memories found." }],
              details: { count: 0 },
            };
          }

          const text = results
            .map(
              (r, i) =>
                `${i + 1}. [${r.entry.category}] ${r.entry.text} (${(r.score * 100).toFixed(0)}%)`,
            )
            .join("\n");

          // Strip vector data for serialization (typed arrays can't be cloned)
          const sanitizedResults = results.map((r) => ({
            id: r.entry.id,
            text: r.entry.text,
            category: r.entry.category,
            importance: r.entry.importance,
            score: r.score,
          }));

          return {
            content: [{ type: "text", text: `Found ${results.length} memories:\n\n${text}` }],
            details: { count: results.length, memories: sanitizedResults },
          };
        },
      },
      { name: "memory_recall" },
    );

    api.registerTool(
      {
        name: "memory_store",
        label: "Memory Store",
        description:
          "Save important information in long-term memory. Use for preferences, facts, decisions.",
        parameters: Type.Object({
          text: Type.String({ description: "Information to remember" }),
          importance: Type.Optional(Type.Number({ description: "Importance 0-1 (default: 0.7)" })),
          category: Type.Optional(stringEnum(MEMORY_CATEGORIES)),
        }),
        async execute(_toolCallId, params) {
          const {
            text,
            importance = 0.7,
            category = "other",
          } = params as {
            text: string;
            importance?: number;
            category?: MemoryEntry["category"];
          };

          const vector = await embeddings.embed(text);

          // Check for duplicates
          const existing = await db.search(vector, 1, 0.95);
          if (existing.length > 0) {
            return {
              content: [
                {
                  type: "text",
                  text: `Similar memory already exists: "${existing[0].entry.text}"`,
                },
              ],
              details: {
                action: "duplicate",
                existingId: existing[0].entry.id,
                existingText: existing[0].entry.text,
              },
            };
          }

          const entry = await db.store({
            text,
            vector,
            importance,
            category,
          });

          return {
            content: [{ type: "text", text: `Stored: "${text.slice(0, 100)}..."` }],
            details: { action: "created", id: entry.id },
          };
        },
      },
      { name: "memory_store" },
    );

    api.registerTool(
      {
        name: "memory_forget",
        label: "Memory Forget",
        description: "Delete specific memories. GDPR-compliant.",
        parameters: Type.Object({
          query: Type.Optional(Type.String({ description: "Search to find memory" })),
          memoryId: Type.Optional(Type.String({ description: "Specific memory ID" })),
        }),
        async execute(_toolCallId, params) {
          const { query, memoryId } = params as { query?: string; memoryId?: string };

          if (memoryId) {
            await db.delete(memoryId);
            return {
              content: [{ type: "text", text: `Memory ${memoryId} forgotten.` }],
              details: { action: "deleted", id: memoryId },
            };
          }

          if (query) {
            const vector = await embeddings.embed(query);
            const results = await db.search(vector, 5, 0.7);

            if (results.length === 0) {
              return {
                content: [{ type: "text", text: "No matching memories found." }],
                details: { found: 0 },
              };
            }

            if (results.length === 1 && results[0].score > 0.9) {
              await db.delete(results[0].entry.id);
              return {
                content: [{ type: "text", text: `Forgotten: "${results[0].entry.text}"` }],
                details: { action: "deleted", id: results[0].entry.id },
              };
            }

            const list = results
              .map((r) => `- [${r.entry.id.slice(0, 8)}] ${r.entry.text.slice(0, 60)}...`)
              .join("\n");

            // Strip vector data for serialization
            const sanitizedCandidates = results.map((r) => ({
              id: r.entry.id,
              text: r.entry.text,
              category: r.entry.category,
              score: r.score,
            }));

            return {
              content: [
                {
                  type: "text",
                  text: `Found ${results.length} candidates. Specify memoryId:\n${list}`,
                },
              ],
              details: { action: "candidates", candidates: sanitizedCandidates },
            };
          }

          return {
            content: [{ type: "text", text: "Provide query or memoryId." }],
            details: { error: "missing_param" },
          };
        },
      },
      { name: "memory_forget" },
    );

    // ========================================================================
    // CLI Commands
    // ========================================================================

    api.registerCli(
      ({ program }) => {
        const memory = program.command("ltm").description("LanceDB memory plugin commands");

        memory
          .command("list")
          .description("List all memories with pagination")
          .option("--limit <n>", "Number of items per page", "20")
          .option("--offset <n>", "Skip first N items", "0")
          .option("--json", "Output as JSON")
          .action(async (opts) => {
            const limit = parseInt(opts.limit);
            const offset = parseInt(opts.offset);
            const count = await db.count();
            const entries = await db.list({ limit, offset });

            if (opts.json) {
              console.log(JSON.stringify({ total: count, offset, limit, entries: entries.map(e => ({
                id: e.id,
                text: e.text,
                category: e.category,
                importance: e.importance,
                createdAt: new Date(e.createdAt).toISOString(),
                username: e.username,
                channel: e.channel,
                chatId: e.chatId,
              }))}, null, 2));
              return;
            }

            console.log(`\nMemories (${offset + 1}-${Math.min(offset + entries.length, count)} of ${count}):\n`);
            for (const entry of entries) {
              const date = new Date(entry.createdAt).toLocaleString();
              const truncatedText = entry.text.length > 100
                ? entry.text.slice(0, 100) + "..."
                : entry.text;
              // Build metadata line
              const meta = [
                entry.username ? `@${entry.username}` : null,
                entry.channel,
              ].filter(Boolean).join(" via ");
              const metaPrefix = meta ? `(${meta}) ` : "";
              console.log(`[${entry.category}] ${metaPrefix}${truncatedText}`);
              console.log(`  id: ${entry.id} | importance: ${entry.importance} | ${date}\n`);
            }

            if (offset + entries.length < count) {
              console.log(`\nNext page: ltm list --offset ${offset + limit} --limit ${limit}`);
            }
          });

        memory
          .command("search")
          .description("Search memories")
          .argument("<query>", "Search query")
          .option("--limit <n>", "Max results", "5")
          .action(async (query, opts) => {
            const vector = await embeddings.embed(query);
            const results = await db.search(vector, parseInt(opts.limit), 0.3);
            // Strip vectors for output
            const output = results.map((r) => ({
              id: r.entry.id,
              text: r.entry.text,
              category: r.entry.category,
              importance: r.entry.importance,
              score: r.score,
            }));
            console.log(JSON.stringify(output, null, 2));
          });

        memory
          .command("stats")
          .description("Show memory statistics")
          .action(async () => {
            const count = await db.count();
            console.log(`Total memories: ${count}`);
          });
      },
      { commands: ["ltm"] },
    );

    // ========================================================================
    // Lifecycle Hooks
    // ========================================================================

    // Auto-recall: inject relevant memories before agent starts
    if (cfg.autoRecall) {
      api.on("before_agent_start", async (event) => {
        if (!event.prompt || event.prompt.length < 5) {
          return;
        }

        try {
          const vector = await embeddings.embed(event.prompt);
          const results = await db.search(vector, 3, 0.3);

          if (results.length === 0) {
            return;
          }

          const memoryContext = results
            .map((r) => `- [${r.entry.category}] ${r.entry.text}`)
            .join("\n");

          api.logger.info?.(`memory-lancedb: injecting ${results.length} memories into context`);

          return {
            prependContext: `<relevant-memories>\nThe following memories may be relevant to this conversation:\n${memoryContext}\n</relevant-memories>`,
          };
        } catch (err) {
          api.logger.warn(`memory-lancedb: recall failed: ${String(err)}`);
        }
      });
    }

    // Auto-capture: analyze and store important information after agent ends
    if (cfg.autoCapture) {
      api.on("agent_end", async (event) => {
        if (!event.success || !event.messages || event.messages.length === 0) {
          return;
        }

        try {
          // Debug: log message count and roles
          const roles = (event.messages as Array<Record<string, unknown>>)
            .map((m) => m?.role ?? "unknown")
            .join(", ");
          debug(`[agent_end] Processing ${event.messages.length} messages, roles: [${roles}]`);
          // TEMP: info-level diagnostics for auto-capture investigation
          api.logger.info(`memory-lancedb: [agent_end] ${event.messages.length} messages, roles: [${roles}]`);

          // Extract text content from messages (handling unknown[] type)
          const texts: string[] = [];
          for (const msg of event.messages) {
            // Type guard for message object
            if (!msg || typeof msg !== "object") {
              continue;
            }
            const msgObj = msg as Record<string, unknown>;

            // Only process user and assistant messages
            const role = msgObj.role;
            if (role !== "user" && role !== "assistant") {
              continue;
            }

            const content = msgObj.content;

            // Handle string content directly
            if (typeof content === "string") {
              texts.push(content);
              continue;
            }

            // Handle array content (content blocks)
            if (Array.isArray(content)) {
              for (const block of content) {
                if (
                  block &&
                  typeof block === "object" &&
                  "type" in block &&
                  (block as Record<string, unknown>).type === "text" &&
                  "text" in block &&
                  typeof (block as Record<string, unknown>).text === "string"
                ) {
                  texts.push((block as Record<string, unknown>).text as string);
                }
              }
            }
          }

          // TEMP: log extracted texts for debugging
          api.logger.info(`memory-lancedb: [agent_end] extracted ${texts.length} texts: ${texts.map(t => t.length > 50 ? t.slice(0, 50) + "..." : t).join(" | ")}`);

          // Filter for capturable content
          const toCapture = texts.filter((text) => text && shouldCapture(text));
          // TEMP: log capture decision
          api.logger.info(`memory-lancedb: [agent_end] toCapture: ${toCapture.length} of ${texts.length}`);
          if (toCapture.length === 0) {
            return;
          }

          // Store each capturable piece (limit to 3 per conversation)
          let stored = 0;
          for (const rawText of toCapture.slice(0, 3)) {
            // Extract metadata from envelope BEFORE stripping it
            const metadata = parseEnvelopeMetadata(rawText);

            // Clean the text before storing (remove injected memory context)
            const text = stripMessageMetadata(rawText);
            if (!text || text.length < 10) {
              continue; // Skip if cleaning left nothing meaningful
            }

            const category = detectCategory(text);
            const vector = await embeddings.embed(text);

            // Check for duplicates (high similarity threshold)
            const existing = await db.search(vector, 1, 0.95);
            if (existing.length > 0) {
              continue;
            }

            await db.store({
              text,
              vector,
              importance: 0.7,
              category,
              username: metadata.username,
              channel: metadata.channel,
              chatId: metadata.chatId,
            });
            stored++;
          }

          if (stored > 0) {
            api.logger.info(`memory-lancedb: auto-captured ${stored} memories`);
          }
        } catch (err) {
          api.logger.warn(`memory-lancedb: capture failed: ${String(err)}`);
        }
      });
    }

    // ========================================================================
    // Service
    // ========================================================================

    api.registerService({
      id: "memory-lancedb",
      start: () => {
        const model = cfg.embedding.model ?? defaultModel;
        api.logger.info(
          `memory-lancedb: initialized (db: ${resolvedDbPath}, provider: ${cfg.embedding.provider}, model: ${model})`,
        );
      },
      stop: () => {
        api.logger.info("memory-lancedb: stopped");
      },
    });
  },
};

export default memoryPlugin;
