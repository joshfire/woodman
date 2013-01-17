/**
 * @fileoverview Internal structure used to represent an event to log.
 *
 * The structure is used in communications between loggers, appenders and
 * layouts. It contains indications such as the message to log (getMessage),
 * the level of the message (getLevel), the log event time (getMillis) or the
 * underlying logger that triggered the event (getLoggerName).
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

define(function () {
  /**
   * Definition of the LogEvent class.
   *
   * @constructor
   * @param {string} loggerName Name of the logger that creates this event
   * @param {string} level The trace level ('info', 'warning', 'error'...)
   * @param {(string|Object|Array.<(string|Object)>)} message The message to
   *  log. The message may contain one or more strings and objects.
   */
  var LogEvent = function (loggerName, level, message) {
    this.time = new Date();
    this.loggerName = loggerName;
    this.level = level;
    this.message = message;
  };


  /**
   * Returns the name of the logger that created the event.
   *
   * @function
   * @return {string} The name of the logger that created the event
   */
  LogEvent.prototype.getLoggerName = function () {
    return this.loggerName;
  };


  /**
   * Returns the trace level.
   *
   * The trace level may be "info", "warning", "error" or some other
   * custom level.
   *
   * @function
   * @return {string} The trace level
   */
  LogEvent.prototype.getLevel = function () {
    return this.level;
  };


  /**
   * Returns the event message(s).
   *
   * @function
   * @return {(string|Object|Array.<(string|Object)>)} Event message
   */
  LogEvent.prototype.getMessage = function () {
    return this.message;
  };


  /**
   * Returns the event time in milliseconds since 1 January 1970.
   *
   * @function
   * @return {number} Event time in milliseconds
   */
  LogEvent.prototype.getMillis = function () {
    return this.time.getTime();
  };


  // Expose the LogEvent constructor
  return LogEvent;
});