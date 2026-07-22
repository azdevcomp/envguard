'use strict';

/**
 * Compares parsed .env.example (the "spec") against parsed .env (the "actual").
 *
 * Returns:
 * {
 *   missing: string[],   // required by example, absent from .env
 *   extra: string[],     // present in .env but not documented in .env.example
 *   empty: string[],     // present in .env but with an empty value
 *   invalid: [{ key, value, pattern }], // fails a declared pattern hint
 *   ok: boolean
 * }
 */
function diffEnv(example, actual) {
  const missing = [];
  const empty = [];
  const invalid = [];

  for (const key of example.keys) {
    if (!(key in actual.entries)) {
      missing.push(key);
      continue;
    }
    const actualEntry = actual.entries[key];
    if (actualEntry.value === '') {
      empty.push(key);
      continue;
    }
    const pattern = example.entries[key] && example.entries[key].pattern;
    if (pattern) {
      let regex;
      try {
        regex = new RegExp(pattern);
      } catch (e) {
        regex = null;
      }
      if (regex && !regex.test(actualEntry.value)) {
        invalid.push({ key, value: actualEntry.value, pattern });
      }
    }
  }

  const exampleKeySet = new Set(example.keys);
  const extra = actual.keys.filter((k) => !exampleKeySet.has(k));

  const ok =
    missing.length === 0 &&
    empty.length === 0 &&
    invalid.length === 0; // extra vars are a warning, not a failure

  return { missing, extra, empty, invalid, ok };
}

module.exports = { diffEnv };
