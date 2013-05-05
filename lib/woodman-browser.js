/**
 * @fileoverview Main entry-point of the Woodman library for execution in Web
 * browsers. The file exposes a LogManager that supports client-side appenders
 * (the console appender in particular) and all known layouts.
 *
 * The code of the different appenders and layouts is loaded using AMD,
 * and registered on the LogManager returned.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global define*/

define(function (require) {
  var LogManager = require('./logmanager');
  var Layout = require('./layout');
  var RegexFilter = require('./filters/regexfilter');
  var ConsoleAppender = require('./appenders/consoleappender');
  var SocketAppender = require('./appenders/socketappender');
  var JSONLayout = require('./layouts/jsonlayout');
  var PatternLayout = require('./layouts/patternlayout');

  LogManager.registerAppender('console', ConsoleAppender);
  LogManager.registerAppender('ConsoleAppender', ConsoleAppender);

  LogManager.registerAppender('socket', SocketAppender);
  LogManager.registerAppender('SocketAppender', SocketAppender);

  LogManager.registerFilter('regex', RegexFilter);
  LogManager.registerFilter('RegexFilter', RegexFilter);

  LogManager.registerLayout('default', Layout);

  LogManager.registerLayout('json', JSONLayout);
  LogManager.registerLayout('JSONLayout', JSONLayout);

  LogManager.registerLayout('pattern', PatternLayout);
  LogManager.registerLayout('PatternLayout', PatternLayout);

  return LogManager;
});