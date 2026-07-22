'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { parseEnvContent } = require('../lib/parseEnv');
const { diffEnv } = require('../lib/diff');

test('detects missing keys', () => {
  const example = parseEnvContent('FOO=1\nBAR=2');
  const actual = parseEnvContent('FOO=1');
  const result = diffEnv(example, actual);
  assert.deepStrictEqual(result.missing, ['BAR']);
  assert.strictEqual(result.ok, false);
});

test('detects extra keys as non-blocking', () => {
  const example = parseEnvContent('FOO=1');
  const actual = parseEnvContent('FOO=1\nEXTRA=2');
  const result = diffEnv(example, actual);
  assert.deepStrictEqual(result.extra, ['EXTRA']);
  assert.strictEqual(result.ok, true);
});

test('detects empty values', () => {
  const example = parseEnvContent('FOO=placeholder');
  const actual = parseEnvContent('FOO=');
  const result = diffEnv(example, actual);
  assert.deepStrictEqual(result.empty, ['FOO']);
  assert.strictEqual(result.ok, false);
});

test('validates against pattern hints', () => {
  const example = parseEnvContent('PORT=3000 # pattern:^[0-9]+$');
  const actualGood = parseEnvContent('PORT=8080');
  const actualBad = parseEnvContent('PORT=abc');

  assert.strictEqual(diffEnv(example, actualGood).ok, true);
  const badResult = diffEnv(example, actualBad);
  assert.strictEqual(badResult.ok, false);
  assert.strictEqual(badResult.invalid[0].key, 'PORT');
});

test('reports ok when everything matches', () => {
  const example = parseEnvContent('FOO=1\nBAR=2');
  const actual = parseEnvContent('FOO=hello\nBAR=world');
  const result = diffEnv(example, actual);
  assert.strictEqual(result.ok, true);
});
