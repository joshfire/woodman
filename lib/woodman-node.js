/**
 * @fileoverview Main entry-point of the Woodman library for execution in a
 * node.js environment. The file exposes a LogManager that supports node.js
 * compatible appenders (e.g. console, file) and all known layouts.
 *
 * The code of the different appenders and layouts is loaded using AMD,
 * and registered on the LogManager returned.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global module*/

if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([
  './logmanager',
  './appenders/consoleappender',
  './appenders/node.js/fileappender',
  './layout',
  './layouts/jsonlayout',
  './layouts/patternlayout'
], function (
  LogManager,
  ConsoleAppender,
  FileAppender,
  Layout,
  JSONLayout,
  PatternLayout) {

  LogManager.registerAppender('console', ConsoleAppender);
  LogManager.registerAppender('ConsoleAppender', ConsoleAppender);

  LogManager.registerAppender('file', FileAppender);
  LogManager.registerAppender('FileAppender', FileAppender);

  LogManager.registerLayout('default', Layout);

  LogManager.registerLayout('json', JSONLayout);
  LogManager.registerLayout('JSONLayout', JSONLayout);

  LogManager.registerLayout('pattern', PatternLayout);
  LogManager.registerLayout('PatternLayout', PatternLayout);
  return LogManager;
});