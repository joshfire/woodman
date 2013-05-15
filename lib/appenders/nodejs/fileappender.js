/**
 * @fileoverview An Appender that delivers log events to a file.
 *
 * This appender only works in a node.js server-side environment.
 * It checks the presence of the "global" global variable and uses
 * "nodeRequire" to load node.js File System module if defined, or
 * "require" otherwise. The "nodeRequire" variable should be exposed by
 * the function that wraps the distribution when Woodman is built with
 * Almond, since Almond overrides "require" for its own purpose.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global module, global, rootRequire, process*/

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function (require) {
  var Appender = require('../../appender');

  // Try to load Node.js File System module, using "rootRequire" if it exists,
  // or the provided "require" function otherwise. The "rootRequire" variable
  // is needed when Woodman is built using Almond since Almond does not support
  // Node.js "require" method as a fallback (as opposed to Require.js).
  // Note that, to have Require.js optimizer miss the fact that we try to
  // import a native module that it would not know how to include, we'll
  // hide require in a "stealth" variable.
  // This code only succeeds in a Node.js environment, obviously, but should
  // fail silently in other environments.
  var stealthRequire = require;
  var fs = null;
  try {
    if ((typeof global !== 'undefined') &&
        global.process &&
        global.process.versions &&
        global.process.versions.node &&
        (typeof rootRequire === 'function')) {
      // The "require" method has likely been overridden by Almond,
      // "nodeRequire" normally contains the actual Node.js "require" method
      fs = rootRequire('fs');
    }
    else {
      fs = stealthRequire('fs');
    }
  }
  catch (err) {}


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
    // standard line ending on Windows platform is \r\n, instead of \n
    // on unix based systems.
    if (process.platform === 'win32') {
      message = message.replace(/\n/g,'\r\n');
    }
    this.stream.write(message);
  };


  /**
   * Opens the file stream for writing
   */
  FileAppender.prototype.start = function (callback) {
    callback = callback || function () {};

    if (this.isStarted()) return callback();
    if (!fs) {
      return callback(
        'The File Appender only runs in a Node.js runtime environment');
    }

    this.stream = fs.createWriteStream(this.fileName, {
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