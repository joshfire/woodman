/**
 * @fileoverview The Logger class exposes the trace functions that modules may
 * use to log events. Modules typically retrieve the instance of the Logger
 * class that they will use through a call to LogManager.getLogger.
 *
 * A Logger is typically associated with one or more appenders and layouts,
 * that provide answers to "where to log" and "how to log" questions.
 *
 * The Logger class should not ever need to be derived, as appenders and layouts
 * are the objects that impose the actions the logger performs when one of the
 * log functions gets called.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */

define([
  './loglevel',
  './logevent'
], function (LogLevel, LogEvent) {
  /**
   * Definition of the Logger class
   *
   * @constructor
   */
  var Logger = function (name, loggerContext) {
    /**
     * Logger name
     */
    this.name = name;

    /**
     * Reference to the logger context that created this logger
     *
     * The reference is used to create appenders and layouts when
     * configuration is applied.
     */
    this.loggerContext = loggerContext;

    /**
     * Parent logger. All loggers have a parent except the root logger
     */
    this.parent = null;

    /**
     * Children loggers. Mostly used during initialization to propagate
     * the configuration.
     */
    this.children = [];

    /**
     * Appenders associated with the logger. Set during initialization
     */
    this.appenders = [];

    /**
     * The trace level of the logger. Log events whose level is below that
     * number are logged. Others are discarded.
     */
    this.level = 'inherit';

    /**
     * Additivity flag. Log events are not propagated to the parent logger
     * if the flag is not set.
     */
    this.additive = true;
  };


  /**
   * Traces an event at the "log" level
   *
   * The function takes any number of parameters.
   *
   * @function
   */
  Logger.prototype.log = function () {
    this.trace('log', arguments);
  };

  /**
   * Traces an event at the "info" level
   *
   * The function takes any number of parameters.
   *
   * @function
   */
  Logger.prototype.info = function () {
    this.trace('info', arguments);
  };

  /**
   * Traces an event at the "warn" level
   *
   * The function takes any number of parameters.
   *
   * @function
   */
  Logger.prototype.warn = function () {
    this.trace('warn', arguments);
  };

  /**
   * Traces an event at the "error" level
   *
   * The function takes any number of parameters.
   *
   * @function
   */
  Logger.prototype.error = function () {
    this.trace('error', arguments);
  };


  /**
   * Traces a log event
   *
   * @function
   * @private
   * @param {number} level Trace level (see LogLevel enumeration)
   * @param {Array} params Trace message and other parameters
   */
  Logger.prototype.trace = function (level, params) {
    var i = 0;
    var messages = [];
    var evt = null;

    if (LogLevel.isBelow(level, this.level)) {
      // The params parameter is an args array, turn it into a proper array
      for (i = 0; i < params.length; i++) {
        messages[i] = params[i];
      }
      evt = new LogEvent(this.name, level, messages);
      this.append(evt);
    }
  };


  /**
   * Applies the appenders of the logger to the given log event.
   *
   * The function follows the logger's ancestors up to and including the first
   * logger that is not additive or up to the root logger. It applies the
   * appenders of each logger each time.
   */
  Logger.prototype.append = function (evt) {
    var i = 0;
    var len = 0;
    var parent = 0;

    // Run the appenders associated with this logger, if any
    for (i = 0, len = this.appenders.length; i < len; i += 1) {
      this.appenders[i].append(evt);
    }

    // Send the event to the logger's parent, provided the logger is additive.
    if (this.additive) {
      parent = this.parent;
      if (parent && LogLevel.isBelow(evt.getLevel(), parent.level)) {
        parent.append(evt);
      }
    }
  };


  /**
   * Resets the logger's configuration.
   *
   * The function should only ever be called by the underlying logger context
   * before a new configuration gets applied.
   *
   * @function
   */
  Logger.prototype.reset = function () {
    this.appenders = [];
    this.level = 'inherit';
    this.additive = true;
  };


  /**
   * Initializes the logger's configuration, the list of appenders it
   * triggers, in particular.
   *
   * The function is called by the logger's context when initializing loggers
   * used throughout the application. It should not be called from any other
   * place, unless there's a very good reason to do so.
   *
   * @function
   * @param {Object} loggerConfig Logger configuration structure, which should
   *  contain an "appenders" array in particular with the proper Appender
   *  instances.
   */
  Logger.prototype.initialize = function (config) {
    config = config || {};

    this.level = (typeof config.level !== 'undefined') ?
      config.level :
      'inherit';
    this.additive = (typeof config.additivity !== 'undefined') ?
      config.additivity :
      true;

    this.appenders = config.appenders || [];
  };

  // Expose the Logger constructor
  return Logger;
});