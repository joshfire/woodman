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

define(['./loggercontext'], function (LoggerContext) {
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
    registerLayout: function (type, layout) {
      return loggerContext.registerLayout(type, layout);
    },
    initialize: function (config) {
      return loggerContext.initialize(config);
    },
    getLogger: function (name) {
      return loggerContext.getLogger(name);
    }
  };
});