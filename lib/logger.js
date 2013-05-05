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
/*global module*/

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function (require) {
  var LogLevel = require('./loglevel');
  var LogEvent = require('./logevent');
  var Message = require('./message');

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
     * Logger filter. Set during initialization
     */
    this.filter = null;

    /**
     * The trace level of the logger. Log events whose level is below that
     * level are logged. Others are discarded.
     */
    this.level = 'inherit';

    /**
     * Additivity flag. Log events are not propagated to the parent logger
     * if the flag is not set.
     */
    this.additive = true;

    /**
     * Appender reference filter
     */
    this.appenderReferenceFilter = null;

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
   * @param {string} level Trace level (see LogLevel)
   * @param {Array} params Trace message and other parameters
   */
  Logger.prototype.trace = function (level, params) {
    var i = 0;
    var messages = [];
    var message = null;
    var len = 0;

    // Create the LogEvent
    var evt = new LogEvent(this.name, level, message);

    // Apply context-wide filter
    // (note "accept" means we'll skip the level filter)
    var decision = 'neutral';
    var filter = null;
    if (this.loggerContext) {
      filter = this.loggerContext.getFilter();
    }
    if (filter) {
      decision = filter.filter(evt);
    }

    // Check event level
    if (decision === 'neutral') {
      if (LogLevel.isBelow(level, this.level)) {
        decision = 'accept';
      }
      else {
        decision = 'deny';
      }
    }

    // Filter event if needed
    if (decision !== 'accept') return;

    // Apply logger filter if there's one
    if (this.filter) {
      decision = this.filter.filter(evt);
      if (decision === 'deny') return;
    }

    // The params parameter is an args array, turn it into a proper array
    len = params.length;
    for (i = 0; i < params.length; i++) {
      messages[i] = params[i];
    }

    // Use the Message instance provided, wrap messages in a
    // Message instance otherwise
    if ((len === 1) && (messages[0] instanceof Message)) {
      message = messages[0];
    }
    else {
      message = new Message(messages);
    }

    // Create the LogEvent and run the logger's appenders
    evt = new LogEvent(this.name, level, message);
    this.append(evt);
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

    // Run the appenders associated with this logger, if any
    for (i = 0, len = this.appenders.length; i < len; i += 1) {
      this.appenders[i].append(evt);
    }

    // Send the event to the logger's parent, provided the logger is additive.
    // (note the trace level of the parent does not matter here, meaning its
    // appenders are executed even if the parent is disabled for direct calls)
    if (this.additive && this.parent) {
      this.parent.append(evt);
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
    this.filter = config.filter || null;
  };

  // Expose the Logger constructor
  return Logger;
});