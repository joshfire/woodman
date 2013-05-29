/**
 * @fileoverview Lays out a log event as a JSON string
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 *
 * This Layout borrows code from a similar class defined in the log4javascript
 * library. Copyright and license:
 *  Copyright 2012 Tim Down.
 *  Licensed under the Apache License, Version 2.0 (the "License")
 *  http://log4javascript.org/
 */
/*global module*/

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function (require) {
  var Layout = require('../layout');
  var serializeObject = require('./simpleobjectserializer');

  /**
   * Lays out a log event as a JSON string
   *
   * Configuration parameters that may be used:
   * - compact: to serialize compact JSON structures. the serialization rather
   * produces a "prettyprint" JSON structure by default.
   * - messageAsObject: to serialize the message as an object structure. The
   * message gets serialized as a string by default.
   * - depth: the depth to with message parameters should be serialized. Only
   * useful when "messageAsObject" is set.
   *
   * @constructor
   * @extends {Layout}
   */
  var JSONLayout = function (config, loggerContext) {
    config = config || {};
    Layout.call(this, config, loggerContext);

    this.compact = config.compact || false;
    this.depth = config.depth || 2;
    this.messageAsObject = config.messageAsObject || false;
  };
  JSONLayout.prototype = new Layout();

  JSONLayout.prototype.toMessageBits = function (evt) {
    var message = evt.getMessage();
    var totalDepth = (this.messageAsObject ? this.depth + 1 : 2);
    if (message) {
      if (this.messageAsObject) {
        message = JSON.parse(serializeObject(message, this.depth, true));
      }
      else {
        message = message.getFormattedMessage();
      }
    }
    else {
      message = '';
    }
    var strObject = {
      time: evt.getMillis(),
      loggerName: evt.getLoggerName(),
      level: evt.getLevel(),
      message: message
    };
    return [serializeObject(strObject, totalDepth, this.compact)];
  };

  // Expose the constructor
  return JSONLayout;
});