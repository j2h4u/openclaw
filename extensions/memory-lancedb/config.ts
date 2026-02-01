import fs from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type MemoryConfig = {
  embedding:
    | {
        provider: "openai";
        model?: string;
        apiKey: string;
      }
    | {
        provider: "local";
        model?: string;
      };
  dbPath?: string;
  autoCapture?: boolean;
  autoRecall?: boolean;
};

export const MEMORY_CATEGORIES = ["preference", "fact", "decision", "entity", "other"] as const;
export type MemoryCategory = (typeof MEMORY_CATEGORIES)[number];

const DEFAULT_OPENAI_MODEL = "text-embedding-3-small";
const DEFAULT_LOCAL_MODEL = "Xenova/all-MiniLM-L6-v2";
const LEGACY_STATE_DIRS: string[] = [];

function resolveDefaultDbPath(): string {
  const home = homedir();
  const preferred = join(home, ".openclaw", "memory", "lancedb");
  try {
    if (fs.existsSync(preferred)) {
      return preferred;
    }
  } catch {
    // best-effort
  }

  for (const legacy of LEGACY_STATE_DIRS) {
    const candidate = join(home, legacy, "memory", "lancedb");
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch {
      // best-effort
    }
  }

  return preferred;
}

const DEFAULT_DB_PATH = resolveDefaultDbPath();

const EMBEDDING_DIMENSIONS: Record<string, number> = {
  // OpenAI models
  "text-embedding-3-small": 1536,
  "text-embedding-3-large": 3072,
  // Local Xenova models
  "Xenova/all-MiniLM-L6-v2": 384,
  "Xenova/all-MiniLM-L12-v2": 384,
  "Xenova/paraphrase-multilingual-MiniLM-L12-v2": 384,
};

function assertAllowedKeys(value: Record<string, unknown>, allowed: string[], label: string) {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length === 0) {
    return;
  }
  throw new Error(`${label} has unknown keys: ${unknown.join(", ")}`);
}

export function vectorDimsForModel(model: string): number {
  const dims = EMBEDDING_DIMENSIONS[model];
  if (!dims) {
    throw new Error(`Unsupported embedding model: ${model}`);
  }
  return dims;
}

function resolveEnvVars(value: string): string {
  return value.replace(/\$\{([^}]+)\}/g, (_, envVar) => {
    const envValue = process.env[envVar];
    if (!envValue) {
      throw new Error(`Environment variable ${envVar} is not set`);
    }
    return envValue;
  });
}

function resolveEmbeddingModel(embedding: Record<string, unknown>, provider: "openai" | "local"): string {
  const defaultModel = provider === "local" ? DEFAULT_LOCAL_MODEL : DEFAULT_OPENAI_MODEL;
  const model = typeof embedding.model === "string" ? embedding.model : defaultModel;
  vectorDimsForModel(model);
  return model;
}

export const memoryConfigSchema = {
  parse(value: unknown): MemoryConfig {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("memory config required");
    }
    const cfg = value as Record<string, unknown>;
    assertAllowedKeys(cfg, ["embedding", "dbPath", "autoCapture", "autoRecall"], "memory config");

    const embedding = cfg.embedding as Record<string, unknown> | undefined;
    if (!embedding) {
      throw new Error("embedding config is required");
    }

    const provider = embedding.provider === "local" ? "local" : "openai";

    if (provider === "local") {
      assertAllowedKeys(embedding, ["provider", "model"], "embedding config");
      const model = resolveEmbeddingModel(embedding, "local");

      return {
        embedding: {
          provider: "local",
          model,
        },
        dbPath: typeof cfg.dbPath === "string" ? cfg.dbPath : DEFAULT_DB_PATH,
        autoCapture: cfg.autoCapture !== false,
        autoRecall: cfg.autoRecall !== false,
      };
    }

    // OpenAI provider (default)
    if (typeof embedding.apiKey !== "string") {
      throw new Error("embedding.apiKey is required for OpenAI provider");
    }
    assertAllowedKeys(embedding, ["provider", "apiKey", "model"], "embedding config");
    const model = resolveEmbeddingModel(embedding, "openai");

    return {
      embedding: {
        provider: "openai",
        model,
        apiKey: resolveEnvVars(embedding.apiKey),
      },
      dbPath: typeof cfg.dbPath === "string" ? cfg.dbPath : DEFAULT_DB_PATH,
      autoCapture: cfg.autoCapture !== false,
      autoRecall: cfg.autoRecall !== false,
    };
  },
  uiHints: {
    "embedding.provider": {
      label: "Embedding Provider",
      help: "Use 'local' for Xenova (no API key needed) or 'openai' for OpenAI",
    },
    "embedding.apiKey": {
      label: "OpenAI API Key",
      sensitive: true,
      placeholder: "sk-proj-...",
      help: "API key for OpenAI embeddings (required only for OpenAI provider)",
    },
    "embedding.model": {
      label: "Embedding Model",
      placeholder: DEFAULT_LOCAL_MODEL,
      help: "Model to use: Xenova/all-MiniLM-L6-v2 (local) or text-embedding-3-small (OpenAI)",
    },
    dbPath: {
      label: "Database Path",
      placeholder: "~/.openclaw/memory/lancedb",
      advanced: true,
    },
    autoCapture: {
      label: "Auto-Capture",
      help: "Automatically capture important information from conversations",
    },
    autoRecall: {
      label: "Auto-Recall",
      help: "Automatically inject relevant memories into context",
    },
  },
};
