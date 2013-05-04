/**
 * @fileoverview Composite filter that contains a list of filters.
 *
 * A composite filter gets automatically created to wrap filters attached to
 * a LoggerContext, Logger, or Appender when there is more than one filter to
 * attach.
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

  /**
   * Definition of the Filter class.
   *
   * @constructor
   * @param {Array(Filter)} The list of filters that compose this instance
   */
  var CompositeFilter = function (filters) {
    Filter.call(this);
    this.filters = filters || [];
  };
  CompositeFilter.prototype = new Filter();


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
  CompositeFilter.prototype.filter = function (evt) {
    var i = 0;
    var len = this.filters.length;
    var result = 'neutral';
    for (i = 0; i < len; i++) {
      result = this.filters[i].filter(evt);
      if (result !== 'neutral') {
        break;
      }
    }
    return result;
  };


  // Expose the Filter class
  return CompositeFilter;
});