/**
 * @fileoverview An Appender that delivers log events to Raven-js (Sentry)
 *
 * The appender may either log objects or strings depending on the
 * "appendStrings" flag set/reset when the appender is initialized.
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
  var Appender = require('../appender');
  var WoodmanError = require('../error');
  var utils = require('../utils');

  /**
   * Definition of the Appender class
   *
   * @constructor
   */
  var RavenAppender = function (config) {
    Appender.call(this, config);

    this.raven = config.raven;
    if (!(this.raven && utils.isFunction(this.raven.captureMessage))) {
      throw new WoodmanError('RavenAppender must be configured with a "raven" property pointing to a Raven object');
    }
  };
  RavenAppender.prototype = new Appender();

  /**
   * Appends the given event.
   *
   * RavenAppender expects logging function to be called with a string
   * (sentry message), optional extra info, and an optional object
   * (sentry options).
   *
   * To last argument of the logging function is always treated as the
   * options object (when there are two or more arguments). Therefore,
   * passing extra info with no options object needs to be written:
   *    logger.log("message string", extra1, extra2, ..., null);
   *
   * @function
   * @param {!LogEvent} evt The logger event to append
   */
  RavenAppender.prototype.doAppend = function (evt) {
    var params = evt.getMessage().getParameters();
    var length = params.length;
    var level = evt.getLevel();
    var message = params[0];
    var options = (length < 2) ? {} : params[length - 1] || {};
    // maps Woodman error levels to Sentry error levels
    var levelsMap = {log: "debug", info: "info", warn: "warning", error: "error"};

    // Raven expects a string, stringify the message
    message = (message === null) ?
        "null" :
        ((message === void 0) ? "undefined" : message.toString());

    options.tags = options.tags || {};
    options.level = options.level || levelsMap[level];

    options.extra = options.extra || {};
    // save any parameter (safe the first and last) in a Sentry "extra"
    if (length > 2) {
      options.extra.__woodmanExtras = params.slice(1, length - 1);
    }

    this.raven.captureMessage(message, options);
  };

  // Expose the constructor
  return RavenAppender;
});
