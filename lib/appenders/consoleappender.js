/**
 * @fileoverview An Appender delivers log events to the console, if it exists.
 *
 * The appender may either log objects or strings depending on the
 * "appendStrings" flag set/reset when the appender is initialized.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global console*/

define(['../appender', '../loglevel'], function (Appender, LogLevel) {
  /**
   * Definition of the Appender class
   *
   * @constructor
   */
  var ConsoleAppender = function (name) {
    Appender.call(this, name);

    /**
     * True to log strings instead of objects
     */
    this.appendStrings = true;
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

    if (level <= LogLevel.log) {
      console.log(message);
    }
    else if (level === LogLevel.info) {
      console.info(message);
    }
    else if (level === LogLevel.warn) {
      console.warn(message);
    }
    else if (level === LogLevel.error) {
      console.error(message);
    }
    else if (level < LogLevel.off) {
      console.log(message);
    }
  };


  // Expose the constructor
  return ConsoleAppender;
});