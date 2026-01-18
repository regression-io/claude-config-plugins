# claude-config-plugins

Plugin marketplace for [claude-config](https://github.com/regression-io/claude-config) - Framework support, language tools, and coding standards as Claude Code plugins.

## Why Plugins Instead of Templates?

These plugins were converted from claude-config templates. The key insight:

| Templates | Plugins |
|-----------|---------|
| Static files copied once | Always active when enabled |
| Can become stale | Update via marketplace refresh |
| Project-only | Global, project, or local scope |
| Manual re-apply | Automatic updates |

**"Always active" is a feature.** If you're working on FastAPI, you ALWAYS want FastAPI guidance - not just at project init.

## Installation

### Add this marketplace

```bash
claude plugin marketplace add regression-io/claude-config-plugins
```

### Install a plugin

```bash
# Global (all projects)
claude plugin install coding-standards@claude-config-plugins --scope user

# Project-specific
claude plugin install fastapi-support@claude-config-plugins --scope project

# Local only (gitignored)
claude plugin install python-support@claude-config-plugins --scope local
```

## Available Plugins

### Core

| Plugin | Description |
|--------|-------------|
| `coding-standards` | Universal best practices - code quality, testing, docs, security |

### Languages

| Plugin | Description |
|--------|-------------|
| `python-support` | Python style, dependencies, patterns |
| `javascript-support` | JavaScript style and patterns |
| `typescript-support` | TypeScript config, style, type patterns |

### Frameworks

| Plugin | Description |
|--------|-------------|
| `fastapi-support` | FastAPI REST APIs (includes Python) |
| `react-js-support` | React + JavaScript (includes JS) |
| `react-ts-support` | React + TypeScript (includes TS) |
| `python-cli-support` | Python CLI applications |
| `mcp-python-support` | MCP Server development in Python |

### Full-Stack

| Plugin | Description |
|--------|-------------|
| `fullstack-fastapi-react` | FastAPI + React monorepo guidance |

## Using with claude-config

If you use [claude-config](https://github.com/regression-io/claude-config), you get:

1. **Hierarchical plugin management** - Enable/disable plugins per directory
2. **Monorepo support** - Different plugins per subdirectory
3. **Inheritance** - Child directories inherit parent plugin settings
4. **Visual UI** - Manage plugins through claude-config's web interface

```bash
# Install claude-config
npm install -g @regression-io/claude-config

# Open UI
claude-config ui

# Navigate to Plugins view to manage per-directory enablement
```

## Plugin Structure

Each plugin contains:

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json      # Plugin metadata
├── skills/              # Auto-invoked knowledge (from template rules)
│   └── skill-name/
│       └── SKILL.md
└── commands/            # Slash commands (from template commands)
    └── command.md
```

## Contributing

1. Fork this repository
2. Create a new plugin directory under `plugins/`
3. Add plugin metadata to `.claude-plugin/marketplace.json`
4. Submit a pull request

## License

MIT
