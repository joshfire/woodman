/**
 * @fileoverview From an external perspective, LogManager is the anchor point
 * for the logging system. In particular, it exposes the "getLogger" function
 * that returns a Logger for use in a given module.
 *
 * LogManager is a static class that maintains an instance of LoggerContext as
 * a singleton.
 *
 * Appenders and layouts that may be used by the LoggerContext must be
 * registered through calls to "registerAppender" and "registerLayout".
 *
 * Note: this implementation can only manage one configuration per application,
 * hence the singleton.
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
  var LoggerContext = require('./loggercontext');

  /**
   * LoggerContext singleton
   */
  var loggerContext = new LoggerContext();


  /**
   * Expose the public functions of the LoggerContext singleton as static
   * functions.
   */
  return {
    registerAppender: function (type, appender) {
      return loggerContext.registerAppender(type, appender);
    },
    registerFilter: function (type, filter) {
      return loggerContext.registerFilter(type, filter);
    },
    registerLayout: function (type, layout) {
      return loggerContext.registerLayout(type, layout);
    },
    registerLevel: function (level, before) {
      return loggerContext.registerLevel(level, before);
    },
    registerStandardLevels: function (level, before) {
      return loggerContext.registerStandardLevels(level, before);
    },
    load: function (config, callback) {
      return loggerContext.load(config, callback);
    },
    unload: function (callback) {
      return loggerContext.stop(callback);
    },
    initialize: function (config) {
      return loggerContext.initialize(config);
    },
    start: function (callback) {
      return loggerContext.start(callback);
    },
    stop: function (callback) {
      return loggerContext.stop(callback);
    },
    getLogger: function (name) {
      return loggerContext.getLogger(name);
    }
  };
});