/**
 * @fileoverview Main entry-point of the Woodman library for execution in all
 * sorts of JavaScript environments. Returns a LogManager that supports
 * appenders that run in all environment (console, memcache) and all known
 * layouts.
 *
 * The code of the different appenders and layouts is loaded using AMD,
 * and registered on the LogManager returned.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */

define([
  './logmanager',
  './appender',
  './layout',
  './appenders/consoleappender',
  './layouts/jsonlayout',
  './layouts/patternlayout'
], function (
  LogManager,
  Appender,
  Layout,
  ConsoleAppender,
  JSONLayout,
  PatternLayout) {

  LogManager.registerAppender(ConsoleAppender);

  LogManager.registerLayout(Layout);
  LogManager.registerLayout(JSONLayout);
  LogManager.registerLayout(PatternLayout);

  return LogManager;
});