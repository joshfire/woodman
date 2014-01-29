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
  var utils = require('../utils');

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
    var lastMsg = null;

    if (this.appendStrings) {
      message = layout.toMessageString(evt);
      if (message && (message.lastIndexOf('\n') === message.length - 1)) {
        message = message.substring(0, message.length - 1);
      }
      this.doAppendMessages(level, [message]);
    }
    else {
      message = layout.toMessageBits(evt, {
        preserveObjects: true
      });
      if (message) {
        lastMsg = message[message.length-1];
        if (lastMsg &&
            utils.isString(lastMsg) &&
            (lastMsg.lastIndexOf('\n') === lastMsg.length - 1)) {
          message[message.length-1] = lastMsg.substring(0, lastMsg.length - 1);
        }
      }
      this.doAppendMessages(level, message);
    }
  };


  /**
   * Appends the given message to the console, using the appropriate console
   * function based on the level.
   *
   * @function
   * @param {number} level Event level
   * @param {Array<*>} messages The messages to append, typically an array of
   *  strings or objects
   */
  ConsoleAppender.prototype.doAppendMessages = function (level, messages) {
    if (typeof console === 'undefined') return;

    if (level === 'info') {
      console.info.apply(console, messages);
    }
    else if (level === 'warn') {
      console.warn.apply(console, messages);
    }
    else if (level === 'error') {
      console.error.apply(console, messages);
    }
    else {
      console.log.apply(console, messages);
    }
  };


  // Expose the constructor
  return ConsoleAppender;
});