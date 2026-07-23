# envguard

[![npm version](https://img.shields.io/npm/v/@azdevcomp/envguard.svg)](https://www.npmjs.com/package/@azdevcomp/envguard)
[![CI](https://github.com/azdevcomp/envguard/actions/workflows/ci.yml/badge.svg)](https://github.com/azdevcomp/envguard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**Stop losing 20 minutes to a missing environment variable.**

`envguard` compares your `.env` to `.env.example` and tells you exactly what's missing, empty, or malformed — before your app crashes with a cryptic error.
$ envguard check

envguard check (.env vs .env.example)

✖ Missing (1)

STRIPE_SECRET_KEY

⚠ Invalid format (1)

PORT (expected to match ^[0-9]+$)

ℹ Not documented in .env.example (1)

LEGACY_FLAG
(not a failure — just letting you know)

✖ .env is out of sync
## The problem

A teammate adds a new required variable to `.env.example` and forgets to tell anyone. You pull the latest code, run the app, and get a wall of stack traces. Ten minutes later you realize you're missing `STRIPE_WEBHOOK_SECRET`. This happens in nearly every team, every week.

`envguard` catches this in one command, with zero configuration and zero backend.

## Install

No install needed:

```bash
npx @azdevcomp/envguard check
```

Or add it to your project:

```bash
npm install --save-dev @azdevcomp/envguard
```

Or install globally:

```bash
npm install -g @azdevcomp/envguard
```

## Usage

```bash
# Compare .env against .env.example
envguard check

# Generate a fresh .env from .env.example
envguard init

# Use different file names/paths (e.g. per environment)
envguard check --env .env.production --example .env.production.example
envguard init --env .env.staging --example .env.staging.example
```

### Exit codes

`envguard check` exits `1` when something is out of sync — which makes it a
perfect fit for a pre-commit hook or a CI step.

### Format validation

Add an inline hint in `.env.example` to validate the *shape* of a value, not just its presence:

```env
DATABASE_URL=postgres://user:pass@host:5432/db # pattern:^postgres://
PORT=3000                                       # pattern:^[0-9]+$
```

## Recommended setup

**1. Run it automatically after install** — add to `package.json`:

```json
{
  "scripts": {
    "postinstall": "npx @azdevcomp/envguard check || true"
  }
}
```

(`|| true` keeps `npm install` from failing outright; drop it if you want installs to hard-fail on drift.)

**2. Add it as a pre-commit hook** (e.g. with [husky](https://github.com/typicode/husky)):

```bash
npx husky add .husky/pre-commit "npx @azdevcomp/envguard check"
```

**3. Add it to CI:**

```yaml
- name: Check env sync
  run: npx @azdevcomp/envguard check
```

## Why not just use Doppler / Vault / Dependabot-style tools?

Those tools solve **secret management at scale** (rotation, access control, multi-environment vaults) — genuinely useful, but heavyweight, and they don't solve the simple everyday problem of *"did I forget to add a variable my teammate just introduced?"*. `envguard` is local-first, has no backend, no account, and takes 10 seconds to add to any project.

## Roadmap / ideas for contributors

- [ ] Pre-commit hook that blocks a commit if `.env.example` wasn't updated when `.env` gained new keys
- [ ] `--ci` machine-readable JSON output
- [ ] Support for `.env.vault`-style encrypted team diffs (keys only, never values)
- [ ] VS Code extension wrapping the same core logic
- [ ] Support YAML/JSON config files, not just `.env`

Contributions welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md). The core logic (`lib/parseEnv.js`, `lib/diff.js`) is deliberately small and dependency-free, so it's an easy first PR.

## License

MIT © [Aziz](https://github.com/azdevcomp)
