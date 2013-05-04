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
   * @param {RegExp|string} regex The regular expression to use. A regular
   *  expression gets created from the parameter if it is a string
   * @param {boolean} useRawMsg Apply regular expression to format string if
   *  there's one, to the formatted message otherwise (default).
   * @param {string} match Decision to take when the event matches the regular
   *  expression. Default is "deny".
   * @param {string} mismatch Decision to taken when the event does not match
   *  the regular expression. Default is "neutral".
   */
  var RegexFilter = function (regex, useRawMsg, match, mismatch) {
    Filter.call(this);
    regex = regex || '';
    if (utils.isString(regex)) {
      regex = new RegExp(regex);
    }

    this.regex = regex;
    this.useRawMsg = !!useRawMsg;
    this.onMatch = match || 'deny';
    this.onMismatch = mismatch || 'neutral';
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