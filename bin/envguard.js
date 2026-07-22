#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('../lib/parseEnv');
const { diffEnv } = require('../lib/diff');
const c = require('../lib/colors');
const pkg = require('../package.json');

const HELP = `
${c.bold('envguard')} — keep your .env in sync with .env.example

${c.bold('Usage')}
  envguard check [options]     Compare .env against .env.example
  envguard init [options]      Generate .env from .env.example
  envguard --version           Print version
  envguard --help              Show this help

${c.bold('Options')}
  --env <file>       Path to the actual env file      (default: .env)
  --example <file>   Path to the example/spec file     (default: .env.example)
  --force            (init only) overwrite existing values
  --ci               Exit non-zero and print machine-friendly output

${c.bold('Examples')}
  envguard check
  envguard check --env .env.production --example .env.production.example
  envguard init
  npx envguard check   # no install needed

${c.bold('.env.example hints')}
  You can annotate expected formats inline:
    DATABASE_URL=postgres://user:pass@host:5432/db # pattern:^postgres://
    PORT=3000

Docs & contributing: https://github.com/YOUR_USERNAME/envguard
`;

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--env') args.env = argv[++i];
    else if (a === '--example') args.example = argv[++i];
    else if (a === '--force') args.force = true;
    else if (a === '--ci') args.ci = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--version' || a === '-v') args.version = true;
    else args._.push(a);
  }
  return args;
}

function runCheck(args) {
  const envPath = path.resolve(args.env || '.env');
  const examplePath = path.resolve(args.example || '.env.example');

  if (!fs.existsSync(examplePath)) {
    console.error(c.red(`✖ No ${path.basename(examplePath)} found at ${examplePath}`));
    console.error(c.gray('  envguard needs a reference file to know what variables are expected.'));
    process.exit(1);
  }

  const example = parseEnvFile(examplePath);
  const actual = parseEnvFile(envPath);

  if (!actual.exists) {
    console.log(c.yellow(`⚠ ${path.basename(envPath)} does not exist yet.`));
    console.log(c.gray(`  Run: envguard init --env ${path.relative(process.cwd(), envPath)}`));
    process.exit(1);
  }

  const result = diffEnv(example, actual);

  console.log(c.bold(`\nenvguard check`) + c.gray(`  (${path.basename(envPath)} vs ${path.basename(examplePath)})\n`));

  if (result.missing.length) {
    console.log(c.red(c.bold(`✖ Missing (${result.missing.length})`)));
    result.missing.forEach((k) => console.log(`  ${c.red('-')} ${k}`));
    console.log('');
  }

  if (result.empty.length) {
    console.log(c.yellow(c.bold(`⚠ Empty values (${result.empty.length})`)));
    result.empty.forEach((k) => console.log(`  ${c.yellow('-')} ${k}`));
    console.log('');
  }

  if (result.invalid.length) {
    console.log(c.yellow(c.bold(`⚠ Invalid format (${result.invalid.length})`)));
    result.invalid.forEach(({ key, pattern }) =>
      console.log(`  ${c.yellow('-')} ${key} ${c.gray(`(expected to match ${pattern})`)}`)
    );
    console.log('');
  }

  if (result.extra.length) {
    console.log(c.blue(c.bold(`ℹ Not documented in ${path.basename(examplePath)} (${result.extra.length})`)));
    result.extra.forEach((k) => console.log(`  ${c.blue('-')} ${k}`));
    console.log(c.gray('  (not a failure — just letting you know)\n'));
  }

  if (result.ok) {
    console.log(c.green(`✔ ${path.basename(envPath)} is in sync with ${path.basename(examplePath)}\n`));
    process.exit(0);
  } else {
    console.log(c.red(`✖ ${path.basename(envPath)} is out of sync\n`));
    process.exit(1);
  }
}

function runInit(args) {
  const envPath = path.resolve(args.env || '.env');
  const examplePath = path.resolve(args.example || '.env.example');

  if (!fs.existsSync(examplePath)) {
    console.error(c.red(`✖ No ${path.basename(examplePath)} found at ${examplePath}`));
    process.exit(1);
  }

  const example = parseEnvFile(examplePath);
  const actual = fs.existsSync(envPath) ? parseEnvFile(envPath) : { keys: [], entries: {} };

  const lines = [];
  let added = 0;

  for (const key of example.keys) {
    if (actual.entries[key] && !args.force) {
      lines.push(`${key}=${actual.entries[key].value}`);
    } else {
      const placeholder = example.entries[key].value || '';
      lines.push(`${key}=${placeholder}`);
      if (!actual.entries[key]) added++;
    }
  }

  fs.writeFileSync(envPath, lines.join('\n') + '\n');

  console.log(c.green(`✔ Wrote ${path.basename(envPath)} (${lines.length} variables, ${added} new)`));
  if (added > 0) {
    console.log(c.gray('  Fill in the real values before running your app.'));
  }
}

function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);
  const command = args._[0];

  if (args.version) {
    console.log(pkg.version);
    return;
  }

  if (args.help || !command) {
    console.log(HELP);
    return;
  }

  if (command === 'check') return runCheck(args);
  if (command === 'init') return runInit(args);

  console.error(c.red(`Unknown command: ${command}`));
  console.log(HELP);
  process.exit(1);
}

main();
