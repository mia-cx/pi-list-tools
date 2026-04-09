# pi-list-tools

A tiny extension that exposes the current tool inventory via `list_tools`.

## What it does

`list_tools` wraps the runtime tool registry and returns:

- built-in tools
- dynamically installed tools

The output comes from the current session state, so it reflects whatever is installed right now.

## Install

Symlink the extension directory into your global extensions folder:

```bash
ln -s ~/Development/mia-cx/pi-list-tools ~/.pi/agent/extensions/pi-list-tools
```

Or install it as a package from git:

```bash
pi install git:github.com/mia-cx/pi-list-tools
```

## System prompt usage

Use `list_tools` in the system prompt instead of naming the host application directly.

The package entrypoint is `index.ts`, so it also works as a git-installed pi package.

Suggested wording:

- Built-in tools: `read`, `write`, `edit`, `bash`, `mcp`
- For anything beyond built-ins, call `list_tools` to inspect the current tool inventory.
