/**
 * @fileoverview Known log levels
 *
 * Log levels are defined as numbers to ease comparison. Additional and
 * intermediary levels may be defined in custom builds (numbers must be
 * lower than 100000.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */

define({
  all: 0,
  trace: 100,
  log: 200,
  info: 300,
  warn: 400,
  error: 500,
  off: 100000
});
