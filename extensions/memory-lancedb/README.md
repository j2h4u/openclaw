# memory-lancedb

Persistent memory plugin for OpenClaw using [LanceDB](https://lancedb.com/) vector database.

Based on the approach described in [Swapping Clawd's Memory to LanceDB with Local Embeddings](https://blog.jasoncochran.io/swapping-clawds-memory-to-lancedb-with-local-embeddings-no-openai-quota-needed/) by Jason Cochran.

## Features

- **Local embeddings** — uses [Xenova/transformers](https://github.com/xenova/transformers.js) for offline embedding generation (no OpenAI API needed)
- **OpenAI embeddings** — optional, for higher quality vectors
- **Multilingual triggers** — auto-capture patterns for 12 languages
- **Configurable language filter** — limit triggers to specific languages

## Configuration

```json
{
  "plugins": {
    "slots": { "memory": "memory-lancedb" },
    "entries": {
      "memory-lancedb": {
        "enabled": true,
        "config": {
          "embedding": {
            "provider": "local",
            "model": "Xenova/all-MiniLM-L6-v2"
          },
          "autoCapture": true,
          "autoRecall": true,
          "language": "auto"
        }
      }
    }
  }
}
```

### Embedding Providers

| Provider | Model | Dimensions | API Key |
|----------|-------|------------|---------|
| `local` | `Xenova/all-MiniLM-L6-v2` (default) | 384 | Not required |
| `local` | `Xenova/all-MiniLM-L12-v2` | 384 | Not required |
| `local` | `Xenova/paraphrase-multilingual-MiniLM-L12-v2` | 384 | Not required |
| `openai` | `text-embedding-3-small` (default) | 1536 | Required |
| `openai` | `text-embedding-3-large` | 3072 | Required |

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `embedding.provider` | `"local"` \| `"openai"` | — | Embedding provider |
| `embedding.model` | `string` | Provider-specific | Model to use |
| `embedding.apiKey` | `string` | — | OpenAI API key (required for openai provider) |
| `dbPath` | `string` | `~/.openclaw/memory/lancedb` | Database storage path |
| `autoCapture` | `boolean` | `true` | Automatically capture important information |
| `autoRecall` | `boolean` | `true` | Automatically inject relevant memories |
| `language` | `string` \| `string[]` | `"auto"` | Language(s) for trigger detection |

## Supported Languages

The plugin includes trigger patterns for 12 languages:

| Code | Language |
|------|----------|
| `en` | English |
| `uk` | Ukrainian |
| `ru` | Russian |
| `by` | Belarusian |
| `kk` | Kazakh |
| `cz` | Czech |
| `fr` | French |
| `es` | Spanish |
| `it` | Italian |
| `pt` | Portuguese |
| `de` | German |
| `common` | Common patterns (phone numbers, emails) |

### Language Filter Examples

```json
// All languages (default)
"language": "auto"

// Single language
"language": "ru"

// Multiple languages
"language": ["en", "ru", "uk"]
```

Note: `common` patterns (phone numbers, emails) are always included regardless of filter.

## Trigger Categories

Auto-capture detects these categories:

| Category | Weight | Examples |
|----------|--------|----------|
| `remember` | 2 | "запомни", "remember", "don't forget" |
| `preference` | 1 | "мне нравится", "I prefer", "my favorite" |
| `decision` | 1 | "мы решили", "we decided", "from now on" |
| `identity` | 2 | "меня зовут", "my name is", phone/email |
| `fact` | 1 | "я работаю", "I live in", "I have" |
| `importance` | 1 | "важно", "always", "never" |

## Tools

The plugin provides three tools:

- **memory_store** — manually store information
- **memory_recall** — search memories by query
- **memory_forget** — delete memories

## Performance

With local embeddings (`Xenova/all-MiniLM-L6-v2`):
- First embed: ~2-3s (model loading)
- Subsequent embeds: 10-20ms
- Memory footprint: ~200MB

## Docker

When building with Docker, the Dockerfile installs plugin dependencies:

```dockerfile
RUN cd extensions/memory-lancedb && \
    npm install && \
    chown -R node:node node_modules
```

The `chown` is required because the container runs as `node` user but `npm install` runs as root during build.
