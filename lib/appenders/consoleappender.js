/**
 * @fileoverview An Appender that delivers log events to the console.
 *
 * The appender may either log objects or strings depending on the
 * "appendStrings" flag set/reset when the appender is initialized.
 *
 * The appender ignores events if the console does not exist.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global console, module*/

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function (require) {
  var Appender = require('../appender');

  /**
   * Definition of the Appender class
   *
   * @constructor
   */
  var ConsoleAppender = function (config) {
    config = config || {};
    Appender.call(this, config);

    /**
     * True to log strings instead of objects
     */
    this.appendStrings = (typeof config.appendStrings !== 'undefined') ?
      config.appendStrings :
      true;
  };
  ConsoleAppender.prototype = new Appender();


  /**
   * Appends the given event.
   *
   * The event is formatted using the underlying Layout, and calls
   * doAppendMessage with the formatted message.
   *
   * @function
   * @param {!LogEvent} evt The logger event to append
   */
  ConsoleAppender.prototype.doAppend = function (evt) {
    var layout = this.getLayout();
    var level = evt.getLevel();
    var message = null;

    if (this.appendStrings) {
      message = layout.toMessageString(evt);
      if (message && (message.lastIndexOf('\n') === message.length - 1)) {
        message = message.substring(0, message.length - 1);
      }
      this.doAppendMessage(level, message);
    }
    else {
      evt = layout.toLogEvent(evt);
      this.doAppendMessage(level, evt);
    }
  };


  /**
   * Appends the given message to the console, using the appropriate console
   * function based on the level.
   *
   * @function
   * @param {number} level Event level
   * @param {*} message The message to append, typically a string or an object
   */
  ConsoleAppender.prototype.doAppendMessage = function (level, message) {
    if (typeof console === 'undefined') return;

    if (level === 'info') {
      console.info(message);
    }
    else if (level === 'warn') {
      console.warn(message);
    }
    else if (level === 'error') {
      console.error(message);
    }
    else {
      console.log(message);
    }
  };


  // Expose the constructor
  return ConsoleAppender;
});