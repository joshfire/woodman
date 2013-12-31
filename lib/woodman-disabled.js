/**
 * @fileoverview Tiny "disabled" version of the Woodman library that returns
 * empty shims for the different objects that the Woodman library exposes to an
 * application.
 *
 * This version is intended to replace the code of the Woodman library in
 * production where authors may want to restrict the size of the resulting
 * application and disable all logging traces.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/* global module */

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function (require) {
  var WoodmanError = require('./error');

  // Returns true if the given object is a function
  // (helper function taken from Underscore.js)
  var _isFunction = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
  };

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _isFunction = function (obj) {
      return typeof obj === 'function';
    };
  }

  /**
   * Function that does nothing
   */
  var noop = function () {};

  /**
   * Function that does nothing (asynchronous version)
   *
   * The function expects the last parameter to be the callback function
   */
  var noopAsync = function () {
    if (arguments && (arguments.length > 0)) {
      if (_isFunction(arguments[arguments.length - 1])) {
        arguments[arguments.length - 1]();
      }
    }
  };

  return {
    registerAppender: noop,
    registerFilter: noop,
    registerLayout: noop,
    registerLevel: noop,
    registerStandardLevels: noop,
    load: noopAsync,
    unload: noopAsync,
    initialize: noopAsync,
    start: noopAsync,
    stop: noopAsync,
    getLogger: function () {
      return {
        log: noop,
        info: noop,
        warn: noop,
        error: noop
      };
    },
    Error: WoodmanError
  };
});