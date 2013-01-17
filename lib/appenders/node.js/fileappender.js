/**
 * @fileoverview An Appender that delivers log events to a file.
 *
 * This appender only works in a node.js server-side environment.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */

define(['../../appender'], function (Appender) {

  /**
   * Appends a log event to a file.
   *
   * @constructor
   * @extends {Appender}
   */
  var FileAppender = function (name) {
    Appender.call(this, name);

    /**
     * Log file name, initialized from the configuration
     */
    this.filename = null;
  };
  FileAppender.prototype = new Appender();


  /**
   * Appends the given event to the underlying log file.
   *
   * This function needs to be overridden in concrete appenders.
   *
   * @function
   * @param {LogEvent} evt The logger event to append
   */
  FileAppender.prototype.doAppend = function (evt) {
    // TODO
  };
});