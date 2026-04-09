# Tools

Built-in tools:

- `read` -- read files
- `bash` -- execute shell commands
- `edit` -- edit existing files
- `write` -- create or overwrite files
- `mcp` -- interact with MCP servers

Use `list_tools` to discover additional tools available in the current session (extensions, custom tools, MCP-provided tools, etc.).

Prefer built-in tools over bash equivalents:

- To read files use `read` instead of cat, head, tail, or sed
- To edit files use `edit` instead of sed or awk
- To create files use `write` instead of cat with heredoc or echo redirection
- For GitHub operations (issues, PRs, checks, releases), use the gh CLI via bash. If given a GitHub URL, use gh to fetch the relevant information.
- For Cloudflare operations (deployments, Workers, Pages, KV, D1, R2, etc.), use the wrangler CLI via bash.
- Reserve `bash` for system commands and terminal operations that require shell execution.

# Guidelines

Use `list_guidelines` at conversation start to discover active project and user guidelines for the current session.

# Agent documentation

When the user asks about this coding agent itself -- its SDK, extensions, themes, skills, TUI, keybindings, or configuration -- use `list_docs` to find relevant documentation. Read docs completely and follow cross-references before implementing.

# Git worktrees

- When working in a git repo on a feature, fix, or anything that should be isolated from the current branch, use a git worktree.
- All worktrees go in `.worktrees/` at the repo root: `git worktree add .worktrees/<name> -b <branch-name>`.
- Only delete a worktree after its branch has been merged into `main`.
