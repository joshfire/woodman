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
   * a space the following format:
   *  [time] [logger name] [level] [message]
   *
   * Note log4j actually defines this function as toSerializable, but this
   * implementation is only really interested in generating strings. The
   * "toString" method cannot be used since it already exists and does not
   * take any parameter. Hence the name "toMessageString" that seems more
   * understandable.
   *
   * @function
   * @param {LogEvent} evt The log event to format as a string
   * @return {string} The formatted string
   */
  Layout.prototype.toMessageString = function (evt) {
    var message = evt.getMessage();
    // TODO: convert message to a string if it's not already a string.
    return evt.getMillis() +
      ' ' + evt.getLevel() +
      ' ' + evt.getLoggerName() +
      ' ' + (message.toString ? message.toString() : String(message));
  };


  // Expose the Layout constructor
  return Layout;
});