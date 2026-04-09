# pi-list-tools

A pi extension that gives the model runtime introspection — it can discover its own tools, guidelines, active model, and documentation paths instead of having them hardcoded into the system prompt.

## Why

Default system prompts bake in a static tool list and host-specific references. When tools change (extensions installed, MCP servers added), the prompt is stale. This extension replaces static sections with live queries the model can call at any time.

## Tools

| Tool | Returns |
|---|---|
| `list_tools` | `Available tools:` with `name: description` bullets for every registered tool (built-in, extension, MCP) |
| `list_guidelines` | `Guidelines:` with the active guideline bullets extracted from the system prompt |
| `current_model` | `Current model:` with the active `provider/id` |
| `runtime_docs` | The pi documentation section with `${readmePath}`, `${docsPath}`, and `${examplesPath}` resolved to real filesystem paths |

All output comes from live session state, so it always reflects what is currently installed.

## Install

```bash
pi install git:github.com/mia-cx/pi-list-tools
```

The package entrypoint is `index.ts`, so it works as a git-installed pi package.

## System prompt

A reference system prompt is included at [SYSTEM.md](SYSTEM.md). It replaces the usual static tool/guideline/docs sections with calls to the tools above, so the model discovers its environment at runtime instead of reading a frozen snapshot.

Use it as-is or adapt the sections you need. See [SYSTEM.md](SYSTEM.md) for the full prompt including tool preferences, guideline discovery, doc lookup, and git worktree conventions.
