'use strict';

// Minimal ANSI color helper — zero dependencies on purpose.
const enabled = process.stdout.isTTY && !process.env.NO_COLOR;

function wrap(code) {
  return (str) => (enabled ? `\x1b[${code}m${str}\x1b[0m` : str);
}

module.exports = {
  red: wrap(31),
  green: wrap(32),
  yellow: wrap(33),
  blue: wrap(34),
  magenta: wrap(35),
  cyan: wrap(36),
  gray: wrap(90),
  bold: wrap(1),
};
