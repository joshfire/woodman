/**
 * @fileoverview An Appender delivers log events to some destination. Log events
 * are formatted according to an underlying Layout.
 *
 * A given logger may reference zero, one or more appenders. When the user sends
 * a "log" event, appenders get called in order. This behavior makes it easy to
 * log events to the console, to a file and to some remote database at the same
 * time if needed.
 *
 * All appenders should derivate from this class and implement the "doAppend"
 * function, or implement the same interface (constructor, "getName" and
 * "append").
 *
 * The Appender class is an internal class. It should never have to be used
 * directly within an application in particular.
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
  var LifeCycle = require('./lifecycle');
  var WoodmanError = require('./error');

  /**
   * Definition of the Appender class
   *
   * @constructor
   */
  var Appender = function (config) {
    config = config || {};

    // Calling base constructor
    LifeCycle.call(this);

    /**
     * Appender config
     */
    this.name = config.name;

    /**
     * Underlying layout
     */
    this.layout = config.layout;

    /**
     * Appender filter
     */
    this.filter = config.filter;

    /**
     * Trace level
     */
    this.level = config.level || 'all';

    /**
     * Function used to determine whether a level is below the
     * trace level of the Appender
     */
    this.isBelow = config.isLogLevelBelow || function () {
      return true;
    };
  };
  Appender.prototype = new LifeCycle();


  /**
   * Retrieves the name of the Appender.
   *
   * @function
   * @return {string} The name of the Appender.
   */
  Appender.prototype.getName = function () {
    return this.name;
  };


  /**
   * Appends the event if its trace level is sufficient.
   *
   * If the trace level is sufficient, the function calls doAppend to
   * append the event.
   *
   * This function should not need to be overridden in derived classes.
   *
   * @function
   * @param {LogEvent} evt The logger event
   */
  Appender.prototype.append = function (evt) {
    if (!this.isStarted()) {
      throw new WoodmanError('Appender "' + this.name + '" ' +
        'must be started before it may be used');
    }

    // Apply appender filter
    // (note "accept" means the check on the level gets bypassed)
    var decision = 'neutral';
    if (this.filter) {
      decision = this.filter.filter(evt);
    }

    // Check event level
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

    this.doAppend(evt);
  };


  /**
   * Appends the given event.
   *
   * This function needs to be overridden in concrete appenders.
   *
   * @function
   * @param {LogEvent} evt The logger event to append
   */
  Appender.prototype.doAppend = function () {};


  /**
   * Retrieves the underlying layout.
   *
   * @function
   * @return {Layout} The underlying layout of this appender
   */
  Appender.prototype.getLayout = function () {
    return this.layout;
  };


  // Expose the Appender constructor
  return Appender;
});