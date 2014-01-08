/**
 * @fileoverview Filter based on a regular expression against logger name.
 *
 * A regex filter filters an incoming log event based on whether its logger
 * name matches a regular expression or not.
 *
 * Wrapped filters get applied in order.
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
  var Filter = require('../filter');
  var utils = require('../utils');

  /**
   * Definition of the RegexFilter class.
   *
   * @constructor
   * @param {Object} config Filter configuration. Possible configuration keys:
   *  - regex: The regular expression to use. String or RegExp. Required.
   *  - match: Decision to take when the event matches the regexp. String.
   *   Default value is "accept".
   *  - mismatch: Decision to take when the event does not match the regexp.
   *   String. Default value is "neutral".
   */
  var RegexLoggerNameFilter = function (config) {
    Filter.call(this);
    config = config || {};

    this.regex = config.regex || '';
    if (utils.isString(this.regex)) {
      this.regex = new RegExp(this.regex);
    }

    this.onMatch = config.match || config.onMatch || 'neutral';
    this.onMismatch = config.mismatch || config.onMismatch || 'deny';
  };

  RegexLoggerNameFilter.prototype = new Filter();


  /**
   * Determines whether the provided log event should be filtered.
   *
   * Applies the filters in order up until one returns a non "neutral" response.
   * Returns that response, or "neutral" otherwise.
   *
   * @function
   * @param {LogEvent} evt
   * @return {string} one of "accept", "deny", "neutral".
   */
  RegexLoggerNameFilter.prototype.filter = function (evt) {
    var loggerName = evt.getLoggerName();

    if (this.regex.test(loggerName)) {
      return this.onMatch;
    }
    else {
      return this.onMismatch;
    }
  };


  // Expose the Filter class
  return RegexLoggerNameFilter;
});