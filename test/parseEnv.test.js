'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { parseEnvContent } = require('../lib/parseEnv');

test('parses simple key=value pairs', () => {
  const { keys, entries } = parseEnvContent('FOO=bar\nBAZ=qux');
  assert.deepStrictEqual(keys, ['FOO', 'BAZ']);
  assert.strictEqual(entries.FOO.value, 'bar');
  assert.strictEqual(entries.BAZ.value, 'qux');
});

test('ignores comments and blank lines', () => {
  const { keys } = parseEnvContent('# a comment\n\nFOO=bar\n  # another\nBAZ=qux');
  assert.deepStrictEqual(keys, ['FOO', 'BAZ']);
});

test('handles empty values', () => {
  const { entries } = parseEnvContent('FOO=');
  assert.strictEqual(entries.FOO.value, '');
});

test('strips surrounding quotes', () => {
  const { entries } = parseEnvContent('FOO="bar baz"\nQUX=\'hello\'');
  assert.strictEqual(entries.FOO.value, 'bar baz');
  assert.strictEqual(entries.QUX.value, 'hello');
});

test('extracts inline pattern hints', () => {
  const { entries } = parseEnvContent(
    'DATABASE_URL=postgres://localhost # pattern:^postgres://'
  );
  assert.strictEqual(entries.DATABASE_URL.pattern, '^postgres://');
  assert.strictEqual(entries.DATABASE_URL.value, 'postgres://localhost');
});

test('ignores invalid variable names', () => {
  const { keys } = parseEnvContent('123FOO=bar\nVALID_KEY=ok');
  assert.deepStrictEqual(keys, ['VALID_KEY']);
});
