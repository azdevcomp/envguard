'use strict';

const fs = require('fs');

/**
 * Parses a .env-style file into an ordered structure.
 * Supports:
 *  - KEY=value
 *  - KEY=           (empty but declared -> considered "present")
 *  - # comments
 *  - inline validation hints: KEY=value # pattern:^https?://
 *
 * Returns:
 * {
 *   keys: string[],                // in file order
 *   entries: { [key]: { value, raw, line, pattern|null } }
 * }
 */
function parseEnvContent(content) {
  const lines = content.split(/\r?\n/);
  const keys = [];
  const entries = {};

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Skip blank lines and full-line comments
    if (trimmed === '' || trimmed.startsWith('#')) return;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) return; // not a valid KEY=VALUE line, ignore

    const key = trimmed.slice(0, eqIndex).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return; // invalid var name, ignore

    let rest = trimmed.slice(eqIndex + 1);

    // Extract inline validation hint: # pattern:REGEX
    let pattern = null;
    const patternMatch = rest.match(/#\s*pattern:(.+)$/);
    if (patternMatch) {
      pattern = patternMatch[1].trim();
      rest = rest.slice(0, rest.indexOf('#')).trim();
    } else {
      // Strip trailing plain comments (not part of value) only if not quoted
      const hashIndex = rest.indexOf('#');
      if (hashIndex !== -1 && !rest.slice(0, hashIndex).match(/["']/)) {
        rest = rest.slice(0, hashIndex).trim();
      }
    }

    let value = rest.trim();
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    keys.push(key);
    entries[key] = { value, raw: line, line: idx + 1, pattern };
  });

  return { keys, entries };
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { keys: [], entries: {}, exists: false };
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return { ...parseEnvContent(content), exists: true };
}

module.exports = { parseEnvContent, parseEnvFile };
