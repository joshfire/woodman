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
/*global module, global, rootRequire, Buffer*/

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
  var RollingFileAppender = function (config) {
    config = config || {};
    Appender.call(this, config);

    /**
     * Log file name, initialized from the configuration. Folders up to the
     * file must exist beforehand.
     * fileName is really the _base_ file name. The real file names will be
     * prepended by a timestamp.
     */
    this.fileName = config.fileName;

    /**
     * The policy used to determine when we should roll the log file. It can be 
     * either time based (roll every x mins), size based (roll when the size
     * of the file is more than x bytes), or both (the first one happening).
     * { time: <timeInMinutes>, size: <sizeInBytes> }
     */
    this.triggeringPolicy = config.triggeringPolicy;

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
  RollingFileAppender.prototype = new Appender();

  /**
   * Checks if we need to roll the log-file. There are two possible conditions,
   * depending on the triggeringPolicy configuration :
   *   - the log has grown too big (size)
   *   - the log has grown too old (time)
   */
  RollingFileAppender.prototype.needsRolling = function() {
    if (this.triggeringPolicy) {
      if (this.triggeringPolicy.size && this.currentLogSize > this.triggeringPolicy.size) {
        return true;
      }
      if (this.triggeringPolicy.time && this.currentLogDate &&
          (Date.now() - this.currentLogDate) > (1000 * this.triggeringPolicy.time)) {
        return true;
      }
    }
    return false;
  };

  /**
   * Generates a filename for the next log file to be opened.
   * The filename is this.fileName preceeded by a timestamp at the second
   * accuracy. If two filenames are generated at the same second, we should
   * handle the case and not return the same filename, otherwise the first log
   * would be deleted. That's why we postpone an index at the end of the timestamp.
   * There will be a problem if the log is rotated more than 99 times in one single
   * second. But that would already be a problem.
   */
  RollingFileAppender.prototype.genFileName = function() {
    var pad = function(n, width, z) {
      z = z || '0';
      n = n + '';
      return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    };
    var twoDigits = function(n) { return pad(n, 2); };
    var d = new Date();
    var timestamp = '' + d.getFullYear() + '-' + twoDigits(d.getMonth()+1) + '-' +
                              twoDigits(d.getDate()) + '-' + twoDigits(d.getHours()) + 'h' +
                              twoDigits(d.getMinutes());

    if (! this.currentTimestamp || (timestamp !== this.currentTimestamp)) {
      this.currentTimeStampIdx = 0;
      this.currentTimestamp = timestamp;
    } else {
      // two logs opened during the same second, so we have to add an index after the filename,
      // or increase if it it's not the first time we open a new log file during this second
      this.currentTimeStampIdx++;
    }

    var newFileName = this.currentTimestamp +
                      '_' + twoDigits(this.currentTimeStampIdx) +
                      '_' + this.fileName;
    return newFileName;
  };

  /**
   * Opens a new logfile, closing the existing one if there is one.
   */
  RollingFileAppender.prototype.createNewlog = function() {
    if (this.stream) {
      this.stream.end();
    }
    // all data queued this far will be written in the stream we are closing
    this.stream = fs.createWriteStream(this.genFileName(), {
      flags: 'w',
      encoding: 'utf8'
    });
    this.currentLogSize = 0;
    this.currentLogDate = new Date();
  };

  /**
   * Appends the given event to the underlying log file.
   *
   * This function needs to be overridden in concrete appenders.
   *
   * @function
   * @param {LogEvent} evt The logger event to append
   */
  RollingFileAppender.prototype.doAppend = function (evt) {
    var layout = this.getLayout();
    var message = null;

    if (this.needsRolling()) {
      this.createNewlog();
    }

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
    if (process.platform == 'win32') {
      message = message.replace(/\n/g,'\r\n');
    }
    this.currentLogSize += Buffer.byteLength(message, 'utf8');
    this.stream.write(message);
  };


  /**
   * Opens the file stream for writing
   */
  RollingFileAppender.prototype.start = function (callback) {
    callback = callback || function () {};

    if (this.isStarted()) return callback();
    if (!fs) {
      return callback(
        'The File Appender only runs in a Node.js runtime environment');
    }

    this.createNewlog();
    this.started = true;
    return callback();
  };


  /**
   * Closes the file
   */
  RollingFileAppender.prototype.stop = function (callback) {
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

  return RollingFileAppender;
});