/**
 * @fileoverview Filter based on a regular expression.
 *
 * A regex filter filters an incoming log event based on whether its message
 * matches a regular expression or not.
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
   *  - useRawMsg: Apply regexp to format string if set, to formatted message
   *   otherwise. Boolean. Default value is false.
   *  - match: Decision to take when the event matches the regexp. String.
   *   Default value is "accept".
   *  - mismatch: Decision to take when the event does not match the regexp.
   *   String. Default value is "neutral".
   */
  var RegexFilter = function (config) {
    Filter.call(this);
    config = config || {};

    this.regex = config.regex || '';
    if (utils.isString(this.regex)) {
      this.regex = new RegExp(this.regex);
    }

    this.useRawMsg = !!config.useRawMsg;
    this.onMatch = config.match || config.onMatch || 'neutral';
    this.onMismatch = config.mismatch || config.onMismatch || 'deny';
  };
  RegexFilter.prototype = new Filter();


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
  RegexFilter.prototype.filter = function (evt) {
    var message = '';
    if (this.useRawMsg) {
      message = evt.getMessage().getFormat();
    }
    else {
      message = evt.getMessage().getFormattedMessage();
    }

    if (this.regex.test(message)) {
      return this.onMatch;
    }
    else {
      return this.onMismatch;
    }
  };


  // Expose the Filter class
  return RegexFilter;
});