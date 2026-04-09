# pi-list-tools

A tiny extension that exposes the current tool inventory via `list_tools`, the current guidelines via `list_guidelines`, and the runtime docs section via `runtime_docs`.

## What it does

`list_tools` returns the same `Available tools:` section style as the built-in system prompt, with one-line snippets.

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

Use `list_tools`, `list_guidelines`, and `runtime_docs` in the system prompt instead of naming the host application directly.

The package entrypoint is `index.ts`, so it also works as a git-installed pi package.

Suggested wording:

- `list_tools` returns `Available tools:` followed by `name: snippet` bullets.
- `list_guidelines` returns `Guidelines:` followed by markdown bullets.
- `runtime_docs` returns the docs block with resolved paths.
