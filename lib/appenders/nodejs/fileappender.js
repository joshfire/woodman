/**
 * @fileoverview An Appender that delivers log events to a file.
 *
 * This appender only works in a node.js server-side environment. It depends on
 * the global 'nodefs' variable to be set and to target Node.js File System
 * module.
 *
 * Having to relay on a global "nodefs" variable is not satisfactory. It leaks
 * a global variable "nodefs" to the global scope. The code should rather
 * contain a line such as:
 *  var fs = require('fs');
 * ... that should do the right thing in a Node.js environment and nothing in
 * any other environment. However, Almond kills that possibility because it
 * overrides Node.js "require" method without any way to call it afterwards.
 *
 * TODO: get back to a "require" call. Replace the code before running the
 * optimizer with a call to a "requirenode" function that resolves to Node's
 * "require" method or to a no-op function.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global module, nodefs*/

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function (require) {
  var Appender = require('../../appender');

  /**
   * Appends a log event to a file.
   *
   * @constructor
   * @extends {Appender}
   */
  var FileAppender = function (config) {
    config = config || {};
    Appender.call(this, config);

    /**
     * Log file name, initialized from the configuration. Folders up to the
     * file must exist beforehand.
     */
    this.fileName = config.fileName;

    /**
     * Append log events to the end of the file when true, clear the file
     * before writing the first log event otherwise.
     */
    this.appendToFile = (typeof config.append !== 'undefined') ?
      !!config.append :
      true;

    /**
     * True to log strings instead of objects
     */
    this.appendStrings = (typeof config.appendStrings !== 'undefined') ?
      config.appendStrings :
      true;

    /**
     * The file stream, initialized by the "start" function
     */
    this.stream = null;
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
    var layout = this.getLayout();
    var message = null;

    if (this.appendStrings) {
      message = layout.toMessageString(evt);
    }
    else {
      evt = layout.toLogEvent(evt);
      if (layout.compactObjects || layout.compact) {
        message = JSON.stringify(evt);
      }
      else {
        message = JSON.stringify(evt, null, 2);
      }
    }
    this.stream.write(message);
  };


  /**
   * Opens the file stream for writing
   */
  FileAppender.prototype.start = function (callback) {
    callback = callback || function () {};

    if (this.isStarted()) return callback();

    this.stream = nodefs.createWriteStream(this.fileName, {
      flags: (this.appendToFile ? 'a' : 'w'),
      encoding: 'utf8'
    });
    this.started = true;
    return callback();
  };


  /**
   * Closes the file
   */
  FileAppender.prototype.stop = function (callback) {
    callback = callback || function () {};
    var self = this;

    if (!this.isStarted()) return callback();
    if (!this.stream) {
      this.started = false;
      return callback();
    }
    this.stream.end(function () {
      self.started = false;
      self.stream = null;
      return callback();
    });
  };

  return FileAppender;
});