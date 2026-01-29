# pplx-cli

A powerful CLI tool for the [Perplexity AI API](https://docs.perplexity.ai/) - search the web and chat with AI from your terminal.

## Features

- 🔍 **Web Search** - Search the web with advanced filtering options
- 💬 **AI Chat** - Chat with Perplexity's AI models with web-grounded responses
- 🌊 **Streaming** - Real-time streaming responses
- 📚 **Citations** - See sources for AI-generated responses
- 🎯 **Multiple Models** - Support for Sonar, Sonar Pro, and Reasoning models
- ⚙️ **Easy Configuration** - Simple API key management

## Installation

```bash
# Using npm
npm install -g pplx-cli

# Using bun
bun install -g pplx-cli

# Using yarn
yarn global add pplx-cli
```

## Quick Start

1. Get your API key from [Perplexity API Portal](https://perplexity.ai/account/api)

2. Configure the CLI:
```bash
pplx config set-key pplx-xxxxxxxxxxxxxxxx
```

3. Start asking questions:
```bash
pplx ask "What are the latest developments in AI?"
```

## Commands

### `pplx config`

Manage your configuration.

```bash
# Save your API key
pplx config set-key <api-key>

# Show current configuration
pplx config show

# Clear configuration
pplx config clear
```

### `pplx ask`

Ask a single question to Perplexity AI.

```bash
# Basic usage
pplx ask "What is the weather in Tokyo?"

# Use a specific model
pplx ask "Explain quantum computing" --model sonar-pro

# Stream the response in real-time
pplx ask "Latest tech news" --stream

# Filter by recency
pplx ask "Breaking news" --recency hour

# Filter by domain
pplx ask "Climate research" --domain nature.com --domain science.org

# Output as JSON
pplx ask "Hello world" --json

# Hide citations
pplx ask "Quick question" --no-citations

# Custom system prompt
pplx ask "Summarize this topic" --system "You are a concise summarizer"
```

**Options:**
- `-m, --model <model>` - Model to use (sonar, sonar-pro, sonar-reasoning, sonar-reasoning-pro)
- `-s, --stream` - Stream the response in real-time
- `-j, --json` - Output raw JSON response
- `-c, --citations` - Show source citations (default: true)
- `--no-citations` - Hide source citations
- `-r, --recency <recency>` - Filter by recency (hour, day, week, month, year)
- `-d, --domain <domains...>` - Filter by domain(s)
- `--system <prompt>` - Custom system prompt

### `pplx search`

Search the web using Perplexity.

```bash
# Basic search
pplx search "climate change research"

# Limit results
pplx search "tech news" --limit 5

# Filter by recency
pplx search "breaking news" --recency day

# Filter by domain
pplx search "AI news" --domain techcrunch.com

# Filter by language
pplx search "news" --language en --language fr

# Filter by country
pplx search "local events" --country US

# Output as JSON
pplx search "query" --json
```

**Options:**
- `-l, --limit <number>` - Maximum number of results (default: 10)
- `-r, --recency <recency>` - Filter by recency (hour, day, week, month, year)
- `-d, --domain <domains...>` - Filter by domain(s)
- `--language <languages...>` - Filter by language(s) using ISO codes (e.g., en, fr, de)
- `--country <code>` - Filter by country using ISO code (e.g., US, GB, IN)
- `-j, --json` - Output raw JSON response

### `pplx chat`

Start an interactive chat session.

```bash
# Start chat
pplx chat

# Use a specific model
pplx chat --model sonar-pro

# With custom system prompt
pplx chat --system "You are a helpful coding assistant"
```

**In-chat commands:**
- `/clear` - Clear conversation history
- `/exit` or `/quit` - Exit the chat
- `/help` - Show help

**Options:**
- `-m, --model <model>` - Model to use
- `--system <prompt>` - Custom system prompt
- `-r, --recency <recency>` - Filter by recency
- `-d, --domain <domains...>` - Filter by domain(s)

## Available Models

| Model | Description |
|-------|-------------|
| `sonar` | Fast, cost-effective model (default) |
| `sonar-pro` | Advanced model with better quality |
| `sonar-reasoning` | Model with reasoning capabilities |
| `sonar-reasoning-pro` | Advanced reasoning model |

## Environment Variables

- `PERPLEXITY_API_KEY` - Your Perplexity API key (alternative to config file)

The config file takes precedence over the environment variable.

## Configuration File

The configuration is stored at `~/.config/pplx-cli/config.json`.

## License

MIT

## Links

- [Perplexity API Documentation](https://docs.perplexity.ai/)
- [GitHub Repository](https://github.com/inclinedadarsh/pplx-cli)
- [Report Issues](https://github.com/inclinedadarsh/pplx-cli/issues)
