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

define(function (require) {
  var LogManager = require('./logmanager');
  var ConsoleAppender = require('./appenders/consoleappender');
  var FileAppender = require('./appenders/nodejs/fileappender');
  var RollingFileAppender = require('./appenders/nodejs/rollingfileappender');
  var RegexFilter = require('./filters/regexfilter');
  var RegexLoggerNameFilter = require('./filters/regexloggernamefilter');
  var Layout = require('./layout');
  var JSONLayout = require('./layouts/jsonlayout');
  var PatternLayout = require('./layouts/patternlayout');

  LogManager.registerAppender('console', ConsoleAppender);
  LogManager.registerAppender('Console', ConsoleAppender);
  LogManager.registerAppender('ConsoleAppender', ConsoleAppender);

  LogManager.registerAppender('file', FileAppender);
  LogManager.registerAppender('File', FileAppender);
  LogManager.registerAppender('FileAppender', FileAppender);

  LogManager.registerAppender('rollingfile', RollingFileAppender);
  LogManager.registerAppender('RollingFile', RollingFileAppender);
  LogManager.registerAppender('RollingFileAppender', RollingFileAppender);

  LogManager.registerFilter('regex', RegexFilter);
  LogManager.registerFilter('RegexFilter', RegexFilter);

  LogManager.registerFilter('regexloggername', RegexLoggerNameFilter);
  LogManager.registerFilter('RegexLoggerNameFilter', RegexLoggerNameFilter);

  LogManager.registerLayout('default', Layout);

  LogManager.registerLayout('json', JSONLayout);
  LogManager.registerLayout('JSONLayout', JSONLayout);

  LogManager.registerLayout('pattern', PatternLayout);
  LogManager.registerLayout('PatternLayout', PatternLayout);

  LogManager.registerStandardLevels();

  return LogManager;
});