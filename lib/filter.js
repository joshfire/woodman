/**
 * @fileoverview Abstract structure used to represent a log event filter.
 *
 * The configuration determines the filters that get attached to the
 * LoggerContext, to Loggers and/or to Appenders.
 *
 * Filters fall in 4 categories as explained in:
 * http://logging.apache.org/log4j/2.x/manual/filters.html
 *
 * Woodman does not support Appender reference filters, meaning it handles the
 * following possibilities:
 *
 * 1. Context-wide Filters apply first. Events that are rejected by these
 * filters will not be passed to loggers for further processing. Once an event
 * has been accepted by a Context-wide filter it will not be evaluated by any
 * other Context-wide Filters nor will the Logger's Level be used to filter the
 * event. The event will be evaluated by Logger and Appender Filters however.
 *
 * 2. Logger Filters are configured on a specified Logger. These are evaluated
 * after the Context-wide Filters and the Log Level for the Logger. Events that
 * are rejected by these filters will be discarded and the event will not be
 * passed to a parent Logger regardless of the additivity setting.
 *
 * 3. Appender Filters are used to determine if a specific Appender should
 * handle the formatting and publication of the event.
 *
 * A filter exposes a "filter" function that takes a LogEvent as parameter and
 * returns one of:
 * - "accept": meaning the event is to be processed without further filtering
 * - "deny": meaning the event should be discarded
 * - "neutral": meaning filter leaves the decision to further filters
 *
 * This base class does not filter any log event. All filters should inherit
 * from this base class.
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
   * Definition of the Filter class.
   *
   * @constructor
   */
  var Filter = function () {
  };


  /**
   * Determines whether the provided log event should be filtered.
   *
   * The base implementation always returns "accept" except if log event is
   * not defined, in which case it returns "deny".
   *
   * @function
   * @param {LogEvent} evt
   * @return {string} one of "accept", "deny", "neutral".
   */
  Filter.prototype.filter = function (evt) {
    if (!evt) {
      return 'deny';
    }
    return 'accept';
  };


  // Expose the Filter class
  return Filter;
});