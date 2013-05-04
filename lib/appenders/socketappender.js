/**
 * @fileoverview An Appender that delivers log events in real time to some
 * server using Web sockets or some fallback mechanism.
 *
 * The code uses socket.io to handle message delivery.
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
  var io = require('../../deps/socket.io.client.js');

  /**
   * Definition of the Appender class
   *
   * @constructor
   */
  var SocketAppender = function (config) {
    config = config || {};
    Appender.call(this, config);

    /**
     * True to log strings instead of objects
     */
    this.appendStrings = (typeof config.appendStrings !== 'undefined') ?
      config.appendStrings :
      true;

    /**
     * Socket server connection point
     */
    this.url = config.url || 'http://localhost';

    /**
     * Socket handle when connection is established
     */
    this.socket = null;
  };
  SocketAppender.prototype = new Appender();


  /**
   * Starts the connection
   */
  SocketAppender.prototype.start = function (callback) {
    callback = callback || function () {};
    var self = this;

    if (this.isStarted()) return callback();

    this.socket = io.connect(this.url, {
      'connect timeout': 5000,
      'max reconnection attempts': 5,
      'try multiple transports': true,
      'reconnect': true
    });
    this.socket.on('connect', function () {
      self.started = true;
      return callback();
    });
    this.socket.once('connect_failed', function () {
      return callback('No way to establish a socket connection to "' +
        self.url + '". Ensure the socket server is up and running.');
    });
  };


  /**
   * Stops the connection
   */
  SocketAppender.prototype.stop = function (callback) {
    callback = callback || function () {};
    var self = this;

    if (!this.isStarted()) return callback();
    if (!this.socket || !this.socket.connected) {
      this.started = false;
      return callback();
    }

    this.socket.once('disconnect', function () {
      self.started = false;
      return callback();
    });
    this.socket.disconnect();
  };


  /**
   * Appends the given event.
   *
   * The event is formatted using the underlying Layout, and calls
   * doAppendMessage with the formatted message.
   *
   * @function
   * @param {!LogEvent} evt The logger event to append
   */
  SocketAppender.prototype.doAppend = function (evt) {
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
  SocketAppender.prototype.doAppendMessage = function (level, message) {
    if (typeof console === 'undefined') return;
    this.socket.emit('log', {
      level: level,
      message: message
    });
  };


  // Expose the constructor
  return SocketAppender;
});