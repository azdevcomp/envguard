# Contributing to envguard

Thanks for considering a contribution! This project is intentionally small and dependency-free — please keep that spirit in any PR.

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/envguard.git
cd envguard
npm install
npm test
```

## Project structure

```
bin/envguard.js     CLI entry point (argument parsing, command dispatch, output)
lib/parseEnv.js     Parses .env-style file content into a structured object
lib/diff.js         Compares a "spec" (.env.example) against "actual" (.env)
lib/colors.js       Tiny zero-dependency ANSI color helper
test/               Unit tests (Node's built-in test runner, no framework needed)
```

## Making a change

1. Fork the repo and create a branch: `git checkout -b my-feature`
2. Add or update tests in `test/` — every behavior change should have a test
3. Run `npm test` and make sure everything passes
4. Try the CLI manually against a real `.env` / `.env.example` pair
5. Open a PR with a clear description of the problem it solves

## Good first issues

- Add support for a new inline hint syntax in `.env.example`
- Improve the CLI output formatting for very long variable lists
- Add a `--json` output mode for CI integrations
- Add Windows-specific test coverage (line endings, paths)

## Code style

- No external dependencies unless there's a very strong reason
- Keep `lib/` framework-agnostic — it should be usable as a library, not just via the CLI
- Prefer explicit, readable code over clever one-liners

## Reporting bugs

Please include: your OS, Node version, and a minimal `.env` / `.env.example` pair that reproduces the issue.
