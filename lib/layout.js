/**
 * @fileoverview Base Log event formatter. A layout takes a log event as input
 * and returns a structure that the appender will log.
 *
 * The returned structure may be:
 * 1. a string (e.g. to log things in a file)
 * 2. a LogEvent (e.g. for console logging)
 *
 * Layouts must derive from this base class (or implement the same interface).
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
   * Lays out a LogEvent in different formats.
   *
   * @constructor
   * @param {Object} config Layout configuration. Structure depends on concrete
   *  layout class being used
   * @param {LoggerContext} loggerContext Reference to the logger context that
   *  gave birth to this layout.
   */
  var Layout = function (config, loggerContext) {
    /**
     * Layout configuration
     */
    this.config = config || {};

    /**
     * Internal reference to the logger context that gave birth to this
     * layout. The reference is mostly useful to access the application's
     * start time, e.g. to compute a relative time counter when logging
     * a message.
     */
    this.loggerContext = loggerContext;
  };


  /**
   * Converts the log event to a LogEvent structure.
   *
   * The function returns the object received. Override this function in
   * derivated classes to convert the structure as needed.
   *
   * @function
   * @param {LogEvent} evt The log event to convert
   * @return {LogEvent} The converted event
   */
  Layout.prototype.toLogEvent = function (evt) {
    return evt;
  };


  /**
   * Formats the log event as a string.
   *
   * The function concatenates the information contained in the event using
   * a space using the following format:
   *  [time] [logger name] [level] [message]
   *
   * @function
   * @param {LogEvent} evt The log event to format as a string
   * @return {string} The formatted string
   */
  Layout.prototype.toMessageString = function (evt) {
    return this.toMessageBits(evt).join(' ');
  };


  /**
   * Formats the log event as an array of "bits".
   *
   * The definition of "bits" depends on provided options. A bit is either a
   * string or an object if "options.preserveObjects" is set.
   *
   * Layouts do not have to generate more than one bit when "preserveObjects"
   * is not set. They should only do so when that makes any sense.
   *
   * @function
   * @param {LogEvent} evt The log event to format as a string
   * @return {string} The formatted string
   */
  Layout.prototype.toMessageBits = function (evt, options) {
    var message = evt.getMessage();
    return [
      evt.getMillis(),
      evt.getLevel(),
      evt.getLoggerName()
    ].concat(message.getFormattedParams(options));
  };


  // Expose the Layout constructor
  return Layout;
});