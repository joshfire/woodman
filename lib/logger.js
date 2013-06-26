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
  var LogEvent = require('./logevent');
  var Message = require('./message');
  var utils = require('./utils');

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
     * Function used to determine whether a log level is below the
     * trace level of the logger
     */
    if (this.loggerContext) {
      this.isBelow = function (level, referenceLevel) {
        return this.loggerContext.logLevel.isBelow(level, referenceLevel);
      };

      // Set trace functions for all registered levels
      utils.each(this.loggerContext.logLevel.getLevels(), function (level) {
        var self = this;
        if (!this[level]) {
          this[level] = function () {
            self.traceAtLevel(level, arguments);
          };
        }
      }, this);
    }
    else {
      this.isBelow = function () {
        return true;
      };
    }
  };


  /**
   * Traces an event at the specified level.
   *
   * @function
   * @private
   * @param {string} level Trace level (see LogLevel)
   * @param {Array} params Trace message and other parameters
   */
  Logger.prototype.traceAtLevel = function (level, params) {
    var i = 0;
    var messages = [];
    var message = null;

    // The params parameter is an args array, turn it into a proper array
    var len = params.length;
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

    // Create the LogEvent
    var evt = new LogEvent(this.name, level, message);

    if (this.loggerContext) {
      // Let the logger context determine what to do with the event.
      // In most cases, the context will just call "this.traceLogEvent".
      return this.loggerContext.traceLogEvent(evt, this);
    }
    else {
      // No logger context attached to this logger, trace the event directly.
      return this.traceLogEvent(evt);
    }
  };


  /**
   * Traces a log event.
   *
   * The function is typically called by the "traceLogEvent" function of the
   * underlying LoggerContext, which is itseld called by the "trace" function
   * of this Logger instance.
   *
   * @function
   * @private
   * @param {LogEvent} evt The log event to trace
   * @param {string?} decision Filter decision so far, 'neutral' by default
   */
  Logger.prototype.traceLogEvent = function (evt, decision) {
    // Check event level unless event has already been accepted
    decision = decision || 'neutral';
    if (decision === 'neutral') {
      if (this.isBelow(evt.getLevel(), this.level)) {
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

    // Run the logger's appenders
    return this.append(evt);
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
    this.filter = null;
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