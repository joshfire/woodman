/**
 * @fileoverview Main entry-point of the Woodman library that integrates all
 * known appenders and layouts. Please note that some appenders may not work
 * depending on the JavaScript environment in which Woodman is run.
 *
 * The code of the different appenders and layouts is loaded using AMD,
 * and registered on the LogManager returned.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global module*/

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function (require) {
  var LogManager = require('./logmanager');
  var ConsoleAppender = require('./appenders/consoleappender');
  var SocketAppender = require('./appenders/socketappender');
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

  LogManager.registerAppender('socket', SocketAppender);
  LogManager.registerAppender('Socket', SocketAppender);
  LogManager.registerAppender('SocketAppender', SocketAppender);

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